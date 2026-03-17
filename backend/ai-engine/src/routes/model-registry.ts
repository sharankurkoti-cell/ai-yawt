const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

// Model registry with auto-update capabilities
class ModelRegistry {
    constructor() {
        this.models = new Map();
        this.updateCheckInterval = 24 * 60 * 60 * 1000; // 24 hours
        this.autoUpdateEnabled = true;
        this.betaTestingEnabled = false;
        this.configPath = path.join(__dirname, '../../config/models.json');
        this.lastUpdateCheck = null;
    }
    
    async initialize() {
        await this.loadCurrentModels();
        await this.checkForUpdates();
        this.startAutoUpdateScheduler();
    }
    
    async loadCurrentModels() {
        try {
            // Load from config file
            const configData = await fs.readFile(this.configPath, 'utf8');
            const config = JSON.parse(configData);
            
            // Initialize with current models
            this.models = new Map();
            for (const [modelId, modelInfo] of Object.entries(config.models.available || {})) {
                this.models.set(modelId, {
                    id: modelId,
                    ...modelInfo,
                    status: 'available',
                    lastChecked: new Date()
                });
            }
            
            console.log(`Loaded ${this.models.size} models from configuration`);
        } catch (error) {
            console.error('Failed to load models from config:', error);
            await this.createDefaultConfig();
        }
    }
    
    async createDefaultConfig() {
        const defaultConfig = {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            models: {
                default: 'gpt-5.3-instant',
                fallback: 'gpt-4o',
                specialized: {
                    coding: 'gpt-5.3-codex',
                    reasoning: 'gpt-5.2-thinking',
                    fast: 'gpt-5.3-instant',
                    cheap: 'gpt-4o-mini'
                },
                available: {
                    'gpt-4o': {
                        version: '4.0',
                        releaseDate: '2024-05-13',
                        status: 'stable',
                        context: 128000,
                        pricing: { input: 0.005, output: 0.015 },
                        capabilities: ['text', 'code', 'reasoning'],
                        provider: 'openai'
                    },
                    'gpt-4o-mini': {
                        version: '1.0',
                        releaseDate: '2024-07-18',
                        status: 'stable',
                        context: 128000,
                        pricing: { input: 0.00015, output: 0.0006 },
                        capabilities: ['text', 'code', 'reasoning'],
                        provider: 'openai'
                    },
                    'gpt-5.2-instant': {
                        version: '5.2.0',
                        releaseDate: '2025-12-11',
                        status: 'stable',
                        context: 200000,
                        pricing: { input: 0.002, output: 0.006 },
                        capabilities: ['text', 'code', 'reasoning', 'agentic'],
                        provider: 'openai'
                    },
                    'gpt-5.2-thinking': {
                        version: '5.2.0',
                        releaseDate: '2025-12-11',
                        status: 'stable',
                        context: 200000,
                        pricing: { input: 0.01, output: 0.03 },
                        capabilities: ['text', 'code', 'reasoning', 'deep-thinking'],
                        provider: 'openai'
                    },
                    'gpt-5.3-instant': {
                        version: '5.3.0',
                        releaseDate: '2026-03-03',
                        status: 'latest',
                        context: 400000,
                        pricing: { input: 0.0015, output: 0.0045 },
                        capabilities: ['text', 'code', 'reasoning', 'agentic', 'multimodal'],
                        provider: 'openai'
                    },
                    'gpt-5.3-codex': {
                        version: '5.3.0',
                        releaseDate: '2026-02-15',
                        status: 'latest',
                        context: 1000000,
                        pricing: { input: 0.003, output: 0.009 },
                        capabilities: ['text', 'code', 'reasoning', 'agentic', 'real-time'],
                        provider: 'openai'
                    }
                },
                deprecated: ['gpt-4', 'gpt-4-turbo'],
                experimental: []
            },
            autoUpdate: {
                enabled: true,
                checkInterval: 86400000, // 24 hours
                autoEnable: true,
                betaTesting: false,
                rolloutStrategy: 'gradual'
            }
        };
        
        await fs.writeFile(this.configPath, JSON.stringify(defaultConfig, null, 2));
        await this.loadCurrentModels();
    }
    
    async checkForUpdates() {
        try {
            console.log('Checking for model updates...');
            this.lastUpdateCheck = new Date();
            
            // Simulate checking OpenAI API for new models
            const updates = await this.fetchModelUpdates();
            
            if (updates.length > 0) {
                console.log(`Found ${updates.length} model updates`);
                await this.processUpdates(updates);
            } else {
                console.log('No model updates found');
            }
            
            return updates;
        } catch (error) {
            console.error('Model update check failed:', error);
            return [];
        }
    }
    
    async fetchModelUpdates() {
        // In a real implementation, this would call the OpenAI API
        // For now, simulate checking for updates
        const updates = [];
        
        // Simulate discovering GPT-5.4 (upcoming model)
        const gpt54Info = {
            id: 'gpt-5.4-instant',
            version: '5.4.0',
            releaseDate: '2026-04-15', // Simulated future release
            status: 'upcoming',
            context: 2000000, // 2M context window
            pricing: { input: 0.001, output: 0.003 },
            capabilities: ['text', 'code', 'reasoning', 'agentic', 'multimodal', 'enhanced-agentic'],
            provider: 'openai'
        };
        
        // Check if this is a new model
        if (!this.models.has(gpt54Info.id)) {
            updates.push({
                type: 'new',
                model: gpt54Info,
                discovered: new Date()
            });
        }
        
        return updates;
    }
    
    async processUpdates(updates) {
        for (const update of updates) {
            if (update.type === 'new') {
                await this.handleNewModel(update.model);
            } else if (update.type === 'updated') {
                await this.handleModelUpdate(update.model, update.previousVersion);
            }
        }
        
        // Save updated configuration
        await this.saveConfiguration();
    }
    
    async handleNewModel(model) {
        console.log(`New model discovered: ${model.id}`);
        
        // Analyze model capabilities
        const capabilities = await this.analyzeModelCapabilities(model.id);
        
        // Add to registry
        this.models.set(model.id, {
            ...model,
            capabilities: capabilities || model.capabilities,
            status: 'discovered',
            discovered: new Date()
        });
        
        // Add to configuration
        const config = await this.loadConfiguration();
        config.models.available[model.id] = {
            ...model,
            capabilities: capabilities || model.capabilities
        };
        
        // Auto-enable if meets criteria
        if (this.shouldAutoEnable(model.id, capabilities || model.capabilities)) {
            await this.enableModel(model.id);
            
            // Update default if this is better
            if (this.isBetterThanCurrent(model.id, config.models.default)) {
                config.models.default = model.id;
                console.log(`Updated default model to: ${model.id}`);
            }
        }
        
        await this.saveConfiguration(config);
        await this.notifyNewModel(model.id, capabilities || model.capabilities);
    }
    
    async handleModelUpdate(model, previousVersion) {
        console.log(`Model updated: ${model.id}`);
        
        // Update registry
        const existing = this.models.get(model.id);
        this.models.set(model.id, {
            ...existing,
            ...model,
            status: 'updated',
            previousVersion,
            updated: new Date()
        });
        
        // Test compatibility
        const compatibility = await this.testModelCompatibility(model.id);
        
        if (compatibility.success) {
            // Gradual rollout
            await this.gradualRollout(model.id);
        } else {
            // Hold for manual review
            await this.holdForReview(model.id, compatibility.issues);
        }
    }
    
    async analyzeModelCapabilities(modelId) {
        // In a real implementation, this would test the model
        // For now, return simulated capabilities
        const capabilityTests = {
            'gpt-5.4-instant': {
                textGeneration: true,
                codeGeneration: true,
                reasoning: true,
                multimodal: true,
                agentic: true,
                contextWindow: 2000000,
                speed: 2000, // ms
                accuracy: 0.95
            }
        };
        
        return capabilityTests[modelId] || null;
    }
    
    shouldAutoEnable(modelId, capabilities) {
        // Auto-enable criteria
        const criteria = {
            codeGeneration: capabilities?.codeGeneration || false,
            reasoning: capabilities?.reasoning || false,
            speed: capabilities?.speed < 5000, // < 5 seconds
            accuracy: capabilities?.accuracy > 0.8
        };
        
        return Object.values(criteria).every(Boolean);
    }
    
    isBetterThanCurrent(newModelId, currentModelId) {
        const newModel = this.models.get(newModelId);
        const currentModel = this.models.get(currentModelId);
        
        if (!newModel || !currentModel) return false;
        
        // Compare based on multiple factors
        const newScore = this.calculateModelScore(newModel);
        const currentScore = this.calculateModelScore(currentModel);
        
        return newScore > currentScore * 1.1; // 10% improvement threshold
    }
    
    calculateModelScore(model) {
        let score = 0;
        
        // Context window (0-30 points)
        score += Math.min(30, model.context / 100000);
        
        // Speed (0-20 points, faster is better)
        if (model.capabilities?.speed) {
            score += Math.max(0, 20 - (model.capabilities.speed / 1000));
        }
        
        // Accuracy (0-30 points)
        if (model.capabilities?.accuracy) {
            score += model.capabilities.accuracy * 30;
        }
        
        // Capabilities (0-20 points)
        const capabilityWeight = {
            codeGeneration: 5,
            reasoning: 5,
            multimodal: 3,
            agentic: 7
        };
        
        if (model.capabilities) {
            for (const [capability, weight] of Object.entries(capabilityWeight)) {
                if (model.capabilities[capability]) {
                    score += weight;
                }
            }
        }
        
        return score;
    }
    
    async enableModel(modelId) {
        console.log(`Auto-enabling model: ${modelId}`);
        
        const model = this.models.get(modelId);
        if (model) {
            model.status = 'enabled';
            model.enabled = new Date();
        }
        
        await this.notifyModelEnabled(modelId);
    }
    
    async gradualRollout(modelId) {
        console.log(`Starting gradual rollout for: ${modelId}`);
        
        // Phase 1: 5% of users
        await this.rolloutToPercentage(modelId, 5);
        
        // Wait for feedback (simulated)
        await this.sleep(1000); // 1 second for demo
        
        // Phase 2: 25% of users
        const feedback = await this.collectFeedback(modelId);
        if (feedback.successRate > 0.95) {
            await this.rolloutToPercentage(modelId, 25);
        }
        
        // Phase 3: 100% rollout
        await this.sleep(1000);
        const finalFeedback = await this.collectFeedback(modelId);
        if (finalFeedback.successRate > 0.98) {
            await this.rolloutToPercentage(modelId, 100);
        }
    }
    
    async rolloutToPercentage(modelId, percentage) {
        console.log(`Rolled out ${modelId} to ${percentage}% of users`);
        // In a real implementation, this would update user configurations
    }
    
    async collectFeedback(modelId) {
        // Simulate feedback collection
        return {
            successRate: 0.99,
            averageLatency: 1500,
            errorRate: 0.01
        };
    }
    
    async holdForReview(modelId, issues) {
        console.log(`Holding ${modelId} for manual review:`, issues);
        
        const model = this.models.get(modelId);
        if (model) {
            model.status = 'review_needed';
            model.issues = issues;
        }
        
        await this.notifyHoldForReview(modelId, issues);
    }
    
    async testModelCompatibility(modelId) {
        // Simulate compatibility testing
        return {
            success: true,
            issues: []
        };
    }
    
    async loadConfiguration() {
        try {
            const configData = await fs.readFile(this.configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            return await this.createDefaultConfig();
        }
    }
    
    async saveConfiguration(config = null) {
        const configToSave = config || await this.loadConfiguration();
        configToSave.lastUpdated = new Date().toISOString();
        await fs.writeFile(this.configPath, JSON.stringify(configToSave, null, 2));
    }
    
    startAutoUpdateScheduler() {
        setInterval(async () => {
            if (this.autoUpdateEnabled) {
                await this.checkForUpdates();
            }
        }, this.updateCheckInterval);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Notification methods (simulated)
    async notifyNewModel(modelId, capabilities) {
        console.log(`NOTIFICATION: New model ${modelId} available with capabilities:`, capabilities);
    }
    
    async notifyModelEnabled(modelId) {
        console.log(`NOTIFICATION: Model ${modelId} has been auto-enabled`);
    }
    
    async notifyHoldForReview(modelId, issues) {
        console.log(`NOTIFICATION: Model ${modelId} held for review:`, issues);
    }
}

// Initialize model registry
const modelRegistry = new ModelRegistry();
modelRegistry.initialize().catch(console.error);

// API Routes

// Get all available models
router.get('/models', async (req, res) => {
    try {
        const config = await modelRegistry.loadConfiguration();
        const models = Array.from(modelRegistry.models.entries())
            .filter(([id, model]) => model.status !== 'deprecated')
            .map(([id, model]) => ({
                id,
                ...model,
                isDefault: id === config.models.default,
                isFallback: id === config.models.fallback,
                isSpecialized: Object.values(config.models.specialized).includes(id)
            }));
        
        res.json({
            success: true,
            models,
            config: config.models,
            lastUpdateCheck: modelRegistry.lastUpdateCheck
        });
    } catch (error) {
        console.error('Failed to get models:', error);
        res.status(500).json({ error: 'Failed to get available models' });
    }
});

// Check for model updates
router.post('/models/check-updates', async (req, res) => {
    try {
        const updates = await modelRegistry.checkForUpdates();
        
        res.json({
            success: true,
            updates,
            lastChecked: modelRegistry.lastUpdateCheck
        });
    } catch (error) {
        console.error('Failed to check for updates:', error);
        res.status(500).json({ error: 'Failed to check for updates' });
    }
});

// Switch default model
router.post('/models/switch', async (req, res) => {
    try {
        const { modelId, useCase } = req.body;
        
        if (!modelId) {
            return res.status(400).json({ error: 'Model ID is required' });
        }
        
        // Validate model availability
        if (!modelRegistry.models.has(modelId)) {
            return res.status(400).json({ error: 'Model not available' });
        }
        
        const config = await modelRegistry.loadConfiguration();
        
        // Update configuration
        let updates = {};
        if (useCase === 'default') {
            updates = { models: { default: modelId } };
        } else if (useCase && config.models.specialized.hasOwnProperty(useCase)) {
            updates = { 
                models: { 
                    specialized: { 
                        [useCase]: modelId 
                    } 
                } 
            };
        } else {
            return res.status(400).json({ error: 'Invalid use case' });
        }
        
        const updatedConfig = await modelRegistry.saveConfiguration({
            ...config,
            ...updates
        });
        
        res.json({
            success: true,
            message: `Switched to ${modelId} for ${useCase}`,
            config: updatedConfig.models
        });
    } catch (error) {
        console.error('Failed to switch model:', error);
        res.status(500).json({ error: 'Failed to switch model' });
    }
});

// Get model information
router.get('/models/:modelId', async (req, res) => {
    try {
        const { modelId } = req.params;
        const model = modelRegistry.models.get(modelId);
        
        if (!model) {
            return res.status(404).json({ error: 'Model not found' });
        }
        
        res.json({
            success: true,
            model
        });
    } catch (error) {
        console.error('Failed to get model info:', error);
        res.status(500).json({ error: 'Failed to get model information' });
    }
});

// Enable/disable auto-update
router.post('/models/auto-update', async (req, res) => {
    try {
        const { enabled, checkInterval, autoEnable, betaTesting } = req.body;
        
        const config = await modelRegistry.loadConfiguration();
        
        const updatedConfig = await modelRegistry.saveConfiguration({
            ...config,
            autoUpdate: {
                enabled: enabled !== undefined ? enabled : config.autoUpdate.enabled,
                checkInterval: checkInterval || config.autoUpdate.checkInterval,
                autoEnable: autoEnable !== undefined ? autoEnable : config.autoUpdate.autoEnable,
                betaTesting: betaTesting !== undefined ? betaTesting : config.autoUpdate.betaTesting
            }
        });
        
        // Update registry settings
        modelRegistry.autoUpdateEnabled = updatedConfig.autoUpdate.enabled;
        modelRegistry.betaTestingEnabled = updatedConfig.autoUpdate.betaTesting;
        
        res.json({
            success: true,
            autoUpdate: updatedConfig.autoUpdate
        });
    } catch (error) {
        console.error('Failed to update auto-update settings:', error);
        res.status(500).json({ error: 'Failed to update auto-update settings' });
    }
});

// Get model comparison
router.get('/models/compare/:model1/:model2', async (req, res) => {
    try {
        const { model1, model2 } = req.params;
        
        const model1Info = modelRegistry.models.get(model1);
        const model2Info = modelRegistry.models.get(model2);
        
        if (!model1Info || !model2Info) {
            return res.status(404).json({ error: 'One or both models not found' });
        }
        
        const comparison = {
            model1: {
                id: model1,
                score: modelRegistry.calculateModelScore(model1Info),
                ...model1Info
            },
            model2: {
                id: model2,
                score: modelRegistry.calculateModelScore(model2Info),
                ...model2Info
            },
            winner: modelRegistry.calculateModelScore(model1Info) > modelRegistry.calculateModelScore(model2Info) ? model1 : model2
        };
        
        res.json({
            success: true,
            comparison
        });
    } catch (error) {
        console.error('Failed to compare models:', error);
        res.status(500).json({ error: 'Failed to compare models' });
    }
});

module.exports = router;
