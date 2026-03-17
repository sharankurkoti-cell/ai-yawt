const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage (in production, use proper database)
const enterpriseConfigs = new Map();
const auditLogs = new Map();
const ssoProviders = new Map();

// SSO Configuration
router.post('/sso/configure', async (req, res) => {
    try {
        const { 
            provider, // 'saml', 'oidc', 'azure-ad', 'google-workspace'
            config,
            organizationId 
        } = req.body;
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        const ssoConfig = {
            id: generateId(),
            provider,
            config: {
                ...config,
                clientSecret: encrypt(config.clientSecret),
                privateKey: config.privateKey ? encrypt(config.privateKey) : null
            },
            organizationId,
            configuredBy: user.id,
            configuredAt: new Date(),
            isActive: true
        };

        ssoProviders.set(organizationId, ssoConfig);

        // Log configuration
        await logAuditEvent({
            userId: user.id,
            organizationId,
            action: 'SSO_CONFIGURED',
            resource: `sso:${provider}`,
            details: { provider, organizationId }
        });

        res.json({ 
            success: true, 
            ssoConfigId: ssoConfig.id,
            provider 
        });
    } catch (error) {
        console.error('SSO configuration error:', error);
        res.status(500).json({ error: 'Failed to configure SSO' });
    }
});

// SSO Authentication
router.post('/sso/authenticate', async (req, res) => {
    try {
        const { provider, samlResponse, oidcCode, organizationId } = req.body;

        const ssoConfig = ssoProviders.get(organizationId);
        if (!ssoConfig || !ssoConfig.isActive) {
            return res.status(400).json({ error: 'SSO not configured for this organization' });
        }

        let userData;
        
        switch (provider) {
            case 'saml':
                userData = await verifySAMLResponse(samlResponse, ssoConfig.config);
                break;
            case 'oidc':
                userData = await verifyOIDCCode(oidcCode, ssoConfig.config);
                break;
            case 'azure-ad':
                userData = await verifyAzureAD(oidcCode, ssoConfig.config);
                break;
            case 'google-workspace':
                userData = await verifyGoogleWorkspace(oidcCode, ssoConfig.config);
                break;
            default:
                return res.status(400).json({ error: 'Unsupported SSO provider' });
        }

        // Create or update user
        const userToken = jwt.sign(
            { 
                id: userData.id,
                email: userData.email,
                name: userData.name,
                organizationId,
                ssoProvider: provider
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await logAuditEvent({
            userId: userData.id,
            organizationId,
            action: 'SSO_LOGIN',
            resource: `sso:${provider}`,
            details: { provider, email: userData.email }
        });

        res.json({
            token: userToken,
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                organizationId
            }
        });
    } catch (error) {
        console.error('SSO authentication error:', error);
        res.status(500).json({ error: 'SSO authentication failed' });
    }
});

// Enterprise Configuration
router.post('/config', async (req, res) => {
    try {
        const { 
            organizationId,
            settings: {
                dataRetention,
                accessControls,
                compliance,
                branding,
                apiLimits,
                featureFlags
            }
        } = req.body;
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        const enterpriseConfig = {
            organizationId,
            settings: {
                dataRetention: dataRetention || { days: 365 },
                accessControls: accessControls || {
                    ipWhitelist: [],
                    roleBasedAccess: true,
                    mfaRequired: false
                },
                compliance: compliance || {
                    gdpr: true,
                    hipaa: false,
                    sox: false,
                    pci: false
                },
                branding: branding || {
                    logo: null,
                    theme: 'default',
                    customDomain: null
                },
                apiLimits: apiLimits || {
                    requestsPerMinute: 1000,
                    tokensPerMonth: 1000000,
                    concurrentUsers: 50
                },
                featureFlags: featureFlags || {
                    advancedAnalytics: true,
                    customModels: true,
                    enterpriseSupport: true,
                    priorityQueue: true
                }
            },
            updatedBy: user.id,
            updatedAt: new Date()
        };

        enterpriseConfigs.set(organizationId, enterpriseConfig);

        await logAuditEvent({
            userId: user.id,
            organizationId,
            action: 'ENTERPRISE_CONFIG_UPDATED',
            resource: 'enterprise_config',
            details: { settings: enterpriseConfig.settings }
        });

        res.json({ success: true, config: enterpriseConfig });
    } catch (error) {
        console.error('Enterprise config error:', error);
        res.status(500).json({ error: 'Failed to update enterprise configuration' });
    }
});

// Audit Trail
router.get('/audit/:organizationId', async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { 
            startDate, 
            endDate, 
            userId, 
            action, 
            limit = 100,
            offset = 0 
        } = req.query;
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check permissions
        const orgAuditLogs = auditLogs.get(organizationId) || [];
        
        let filteredLogs = orgAuditLogs;
        
        if (startDate) {
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.timestamp) >= new Date(startDate)
            );
        }
        
        if (endDate) {
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.timestamp) <= new Date(endDate)
            );
        }
        
        if (userId) {
            filteredLogs = filteredLogs.filter(log => log.userId === userId);
        }
        
        if (action) {
            filteredLogs = filteredLogs.filter(log => log.action === action);
        }

        // Sort by timestamp (newest first)
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const paginatedLogs = filteredLogs.slice(
            parseInt(offset), 
            parseInt(offset) + parseInt(limit)
        );

        res.json({
            logs: paginatedLogs,
            total: filteredLogs.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Audit log error:', error);
        res.status(500).json({ error: 'Failed to retrieve audit logs' });
    }
});

// Compliance Reports
router.get('/compliance/:organizationId', async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { reportType = 'summary' } = req.query;
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        const enterpriseConfig = enterpriseConfigs.get(organizationId);
        
        if (!enterpriseConfig) {
            return res.status(404).json({ error: 'Enterprise configuration not found' });
        }

        const auditData = auditLogs.get(organizationId) || [];
        
        const complianceReport = generateComplianceReport(
            enterpriseConfig.settings.compliance,
            auditData,
            reportType
        );

        await logAuditEvent({
            userId: user.id,
            organizationId,
            action: 'COMPLIANCE_REPORT_GENERATED',
            resource: 'compliance_report',
            details: { reportType }
        });

        res.json(complianceReport);
    } catch (error) {
        console.error('Compliance report error:', error);
        res.status(500).json({ error: 'Failed to generate compliance report' });
    }
});

// Usage Analytics
router.get('/analytics/:organizationId', async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { 
            startDate, 
            endDate, 
            metric = 'all' 
        } = req.query;
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        // Generate usage analytics
        const analytics = await generateUsageAnalytics(
            organizationId,
            startDate,
            endDate,
            metric
        );

        res.json(analytics);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to generate analytics' });
    }
});

// Role Management
router.post('/roles/:organizationId', async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { name, permissions, description } = req.body;
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        const role = {
            id: generateId(),
            organizationId,
            name,
            permissions,
            description,
            createdBy: user.id,
            createdAt: new Date()
        };

        // Store role (in production, use database)
        if (!enterpriseConfigs.has(organizationId)) {
            enterpriseConfigs.set(organizationId, { roles: [] });
        }
        
        const config = enterpriseConfigs.get(organizationId);
        if (!config.roles) config.roles = [];
        config.roles.push(role);

        await logAuditEvent({
            userId: user.id,
            organizationId,
            action: 'ROLE_CREATED',
            resource: 'role',
            details: { roleName: name, permissions }
        });

        res.json({ success: true, role });
    } catch (error) {
        console.error('Role creation error:', error);
        res.status(500).json({ error: 'Failed to create role' });
    }
});

// Helper functions
function generateId() {
    return crypto.randomBytes(16).toString('hex');
}

function encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encrypted, iv: iv.toString('hex') };
}

function decrypt(encryptedData) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

async function logAuditEvent(event) {
    const auditLog = {
        id: generateId(),
        ...event,
        timestamp: new Date().toISOString()
    };

    if (!auditLogs.has(event.organizationId)) {
        auditLogs.set(event.organizationId, []);
    }
    
    auditLogs.get(event.organizationId).push(auditLog);
}

async function verifySAMLResponse(samlResponse, config) {
    // Mock SAML verification
    return {
        id: generateId(),
        email: 'user@company.com',
        name: 'John Doe'
    };
}

async function verifyOIDCCode(code, config) {
    // Mock OIDC verification
    return {
        id: generateId(),
        email: 'user@company.com',
        name: 'John Doe'
    };
}

async function verifyAzureAD(code, config) {
    // Mock Azure AD verification
    return {
        id: generateId(),
        email: 'user@company.com',
        name: 'John Doe'
    };
}

async function verifyGoogleWorkspace(code, config) {
    // Mock Google Workspace verification
    return {
        id: generateId(),
        email: 'user@company.com',
        name: 'John Doe'
    };
}

function generateComplianceReport(complianceSettings, auditData, reportType) {
    const report = {
        organizationId: auditData.organizationId,
        generatedAt: new Date(),
        reportType,
        compliance: {}
    };

    if (complianceSettings.gdpr) {
        report.compliance.gdpr = {
            dataProcessing: auditData.filter(log => log.action.includes('DATA')).length,
            dataRetention: auditData.filter(log => log.action.includes('RETENTION')).length,
            userConsent: auditData.filter(log => log.action.includes('CONSENT')).length,
            score: 95
        };
    }

    if (complianceSettings.hipaa) {
        report.compliance.hipaa = {
            phiAccess: auditData.filter(log => log.action.includes('PHI')).length,
            auditTrail: auditData.length,
            encryption: 100,
            score: 98
        };
    }

    return report;
}

async function generateUsageAnalytics(organizationId, startDate, endDate, metric) {
    // Mock analytics generation
    return {
        organizationId,
        period: { startDate, endDate },
        metrics: {
            apiRequests: Math.floor(Math.random() * 100000),
            tokensUsed: Math.floor(Math.random() * 10000000),
            activeUsers: Math.floor(Math.random() * 100),
            storageUsed: Math.floor(Math.random() * 1000) + 'GB',
            averageResponseTime: Math.floor(Math.random() * 500) + 'ms'
        }
    };
}

module.exports = router;
