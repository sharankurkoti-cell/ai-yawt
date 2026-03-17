const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Security scanning endpoint
router.post('/scan', async (req, res) => {
    try {
        const { code, language } = req.body;

        // Static analysis rules
        const vulnerabilities = performStaticAnalysis(code, language);
        
        // AI-powered security analysis
        const aiVulnerabilities = await performAISecurityAnalysis(code, language);
        
        // Combine results
        const allVulnerabilities = [...vulnerabilities, ...aiVulnerabilities];
        
        // Calculate security score
        const score = calculateSecurityScore(allVulnerabilities, code.length);

        res.json({
            vulnerabilities: allVulnerabilities,
            score,
            totalLines: code.split('\n').length,
            scannedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Security scan error:', error);
        res.status(500).json({ error: 'Failed to perform security scan' });
    }
});

function performStaticAnalysis(code, language) {
    const vulnerabilities = [];
    const lines = code.split('\n');

    // SQL Injection patterns
    const sqlPatterns = [
        /execute\s*\(\s*['"`][^'"`]*\+.*['"`]/gi,
        /query\s*\(\s*['"`][^'"`]*\+.*['"`]/gi,
        /\$\{.*\}.*\b(SELECT|INSERT|UPDATE|DELETE)\b/gi
    ];

    // XSS patterns
    const xssPatterns = [
        /innerHTML\s*=\s*.*\+/gi,
        /document\.write\s*\(\s*.*\+/gi,
        /dangerouslySetInnerHTML/gi
    ];

    // Hardcoded secrets patterns
    const secretPatterns = [
        /password\s*=\s*['"`][^'"`]{4,}['"`]/gi,
        /api[_-]?key\s*=\s*['"`][^'"`]{10,}['"`]/gi,
        /secret[_-]?key\s*=\s*['"`][^'"`]{10,}['"`]/gi,
        /token\s*=\s*['"`][^'"`]{10,}['"`]/gi
    ];

    // Insecure crypto patterns
    const cryptoPatterns = [
        /md5\s*\(/gi,
        /sha1\s*\(/gi,
        /DES\s*\(/gi,
        /RC4\s*\(/gi
    ];

    // Path traversal patterns
    const pathTraversalPatterns = [
        /\.\.\/\//gi,
        /\.\.\\/gi,
        /readFile\s*\(\s*.*\+/gi,
        /open\s*\(\s*.*\+/gi
    ];

    // Command injection patterns
    const commandPatterns = [
        /exec\s*\(\s*.*\+/gi,
        /system\s*\(\s*.*\+/gi,
        /eval\s*\(\s*.*\+/gi,
        /spawn\s*\(\s*.*\+/gi
    ];

    // Insecure HTTP patterns
    const httpPatterns = [
        /http:\/\/[^localhost]/gi,
        /ws:\/\//gi
    ];

    // Weak random patterns
    const randomPatterns = [
        /Math\.random\s*\(\s*\)/gi,
        /rand\s*\(\s*\)/gi
    ];

    const securityRules = [
        { patterns: sqlPatterns, type: 'SQL Injection', severity: 'critical', recommendation: 'Use parameterized queries or prepared statements' },
        { patterns: xssPatterns, type: 'Cross-Site Scripting (XSS)', severity: 'high', recommendation: 'Sanitize user input before rendering HTML' },
        { patterns: secretPatterns, type: 'Hardcoded Secrets', severity: 'high', recommendation: 'Use environment variables or secure secret management' },
        { patterns: cryptoPatterns, type: 'Insecure Cryptographic Algorithm', severity: 'medium', recommendation: 'Use strong cryptographic algorithms like SHA-256 or bcrypt' },
        { patterns: pathTraversalPatterns, type: 'Path Traversal', severity: 'high', recommendation: 'Validate and sanitize file paths' },
        { patterns: commandPatterns, type: 'Command Injection', severity: 'critical', recommendation: 'Avoid executing user input directly. Use safe alternatives.' },
        { patterns: httpPatterns, type: 'Insecure HTTP Communication', severity: 'medium', recommendation: 'Use HTTPS for all communication' },
        { patterns: randomPatterns, type: 'Weak Random Number Generation', severity: 'medium', recommendation: 'Use cryptographically secure random number generators' }
    ];

    lines.forEach((line, index) => {
        securityRules.forEach(rule => {
            rule.patterns.forEach(pattern => {
                const matches = line.match(pattern);
                if (matches) {
                    vulnerabilities.push({
                        type: rule.type,
                        severity: rule.severity,
                        line: index,
                        description: `Potential ${rule.type} vulnerability detected`,
                        code: line.trim(),
                        recommendation: rule.recommendation,
                        pattern: pattern.toString()
                    });
                }
            });
        });
    });

    return vulnerabilities;
}

async function performAISecurityAnalysis(code, language) {
    try {
        const systemPrompt = `You are a cybersecurity expert specializing in code security analysis. 
        Analyze the following ${language} code for security vulnerabilities.
        
        Look for:
        - Input validation issues
        - Authentication and authorization problems
        - Data exposure risks
        - Business logic flaws
        - Configuration security issues
        - Dependency vulnerabilities
        - Race conditions
        - Memory safety issues
        - Cryptographic weaknesses
        - API security issues
        
        For each vulnerability found, provide:
        - Type of vulnerability
        - Severity level (low, medium, high, critical)
        - Line number (if identifiable)
        - Description
        - Recommendation for fixing
        
        Format your response as JSON array of objects.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Analyze this ${language} code for security vulnerabilities:\n\n${code}` }
            ],
            max_tokens: 2000,
            temperature: 0.2
        });

        const aiResponse = completion.choices[0]?.message.content || '';
        
        try {
            // Parse AI response as JSON
            const aiVulnerabilities = JSON.parse(aiResponse);
            return Array.isArray(aiVulnerabilities) ? aiVulnerabilities : [];
        } catch (parseError) {
            // If parsing fails, return empty array
            console.warn('Failed to parse AI security analysis response:', parseError);
            return [];
        }
    } catch (error) {
        console.error('AI security analysis error:', error);
        return [];
    }
}

function calculateSecurityScore(vulnerabilities, codeLength) {
    let score = 100;
    
    vulnerabilities.forEach(vuln => {
        switch (vuln.severity) {
            case 'critical':
                score -= 25;
                break;
            case 'high':
                score -= 15;
                break;
            case 'medium':
                score -= 8;
                break;
            case 'low':
                score -= 3;
                break;
        }
    });

    // Adjust for code size (larger codebases naturally have more issues)
    const sizeFactor = Math.min(codeLength / 1000, 2);
    score = Math.max(0, score + (sizeFactor * 5));

    return Math.round(score);
}

// Security fix suggestions
router.post('/suggest-fixes', async (req, res) => {
    try {
        const { code, language, vulnerabilities } = req.body;

        const systemPrompt = `You are a security expert. Provide secure code fixes for the following vulnerabilities in ${language} code.
        
        For each vulnerability:
        - Provide the fixed code
        - Explain what was changed
        - Explain why the fix is secure
        - Mention any trade-offs or additional considerations
        
        Format your response as a JSON object with vulnerability types as keys.`;

        const vulnerabilityDescriptions = vulnerabilities.map(v => 
            `${v.type} (Line ${v.line}): ${v.description}`
        ).join('\n');

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Fix these security vulnerabilities in ${language} code:\n\nVulnerabilities:\n${vulnerabilityDescriptions}\n\nCode:\n${code}` }
            ],
            max_tokens: 3000,
            temperature: 0.2
        });

        const fixes = completion.choices[0]?.message.content || '';

        res.json({
            fixes,
            vulnerabilitiesFixed: vulnerabilities.length
        });
    } catch (error) {
        console.error('Security fix suggestions error:', error);
        res.status(500).json({ error: 'Failed to generate security fix suggestions' });
    }
});

// Dependency vulnerability scanning
router.post('/scan-dependencies', async (req, res) => {
    try {
        const { dependencies, language } = req.body;

        // This would integrate with dependency scanning services like Snyk, OWASP, etc.
        // For now, provide a mock implementation
        const knownVulnerabilities = {
            'lodash': { version: '<4.17.21', severity: 'high', cve: 'CVE-2021-23337' },
            'express': { version: '<4.17.3', severity: 'medium', cve: 'CVE-2022-24999' },
            'axios': { version: '<0.21.1', severity: 'medium', cve: 'CVE-2021-3749' },
            'request': { version: '<2.88.2', severity: 'high', cve: 'CVE-2023-28155' }
        };

        const vulnerableDeps = [];

        dependencies.forEach(dep => {
            const vuln = knownVulnerabilities[dep.name];
            if (vuln && this.isVersionVulnerable(dep.version, vuln.version)) {
                vulnerableDeps.push({
                    name: dep.name,
                    currentVersion: dep.version,
                    vulnerableVersion: vuln.version,
                    severity: vuln.severity,
                    cve: vuln.cve,
                    recommendation: `Update to latest version`
                });
            }
        });

        res.json({
            vulnerabilities: vulnerableDeps,
            totalDependencies: dependencies.length,
            vulnerableCount: vulnerableDeps.length,
            scannedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Dependency scan error:', error);
        res.status(500).json({ error: 'Failed to scan dependencies' });
    }
});

// Security best practices check
router.post('/best-practices', async (req, res) => {
    try {
        const { code, language } = req.body;

        const systemPrompt = `You are a security expert. Review the following ${language} code for security best practices.
        
        Check for:
        - Proper input validation
        - Secure error handling
        - Proper authentication/authorization
        - Secure data storage
        - Proper logging (no sensitive data)
        - Secure configuration
        - Proper session management
        - Secure API design
        - Proper encryption usage
        
        Provide recommendations for improvement, even if no vulnerabilities are found.
        Format as JSON with categories and specific recommendations.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Review this ${language} code for security best practices:\n\n${code}` }
            ],
            max_tokens: 2000,
            temperature: 0.2
        });

        const recommendations = completion.choices[0]?.message.content || '';

        res.json({
            recommendations,
            language,
            reviewedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Best practices check error:', error);
        res.status(500).json({ error: 'Failed to check security best practices' });
    }
});

// Helper function to check version vulnerability
function isVersionVulnerable(current, vulnerableRange) {
    // Simplified version comparison - in reality, you'd use a proper semver library
    return current.includes('<') || current === vulnerableRange;
}

module.exports = router;
