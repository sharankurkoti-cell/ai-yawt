const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for usage tracking (in production, use database)
const userUsage = new Map();
const billingEvents = new Map();

// Token pricing rates (per 1K tokens)
const TOKEN_RATES = {
    'gpt-4o-mini': { input: 0.0001, output: 0.0006 },
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-5.2': { input: 0.02, output: 0.06 },
    'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
    'claude-3.5-haiku': { input: 0.00025, output: 0.00125 }
};

// Service pricing rates
const SERVICE_RATES = {
    'voice_transcription': 0.006, // per minute
    'voice_command': 0.02, // per minute
    'gpu_standard': 0.10, // per minute
    'gpu_premium': 0.25, // per minute
    'gpu_enterprise': 0.50, // per minute
    'security_scan': 0.01, // per scan
    'agent_mode': 0.05 // per task
};

// Usage tracking class
class UsageTracker {
    constructor(userId) {
        this.userId = userId;
        this.monthlyUsage = {
            tokens: { input: 0, output: 0 },
            services: {
                voice: { minutes: 0 },
                gpu: { minutes: 0 },
                security: { scans: 0 },
                agent: { tasks: 0 }
            },
            requests: 0,
            cost: 0
        };
        this.dailyUsage = {
            date: new Date().toISOString().split('T')[0],
            tokens: { input: 0, output: 0 },
            services: {
                voice: { minutes: 0 },
                gpu: { minutes: 0 },
                security: { scans: 0 },
                agent: { tasks: 0 }
            },
            requests: 0,
            cost: 0
        };
        this.billingCycle = this.getBillingCycle();
        this.limits = this.getUserLimits();
    }
    
    trackTokenUsage(inputTokens, outputTokens, model) {
        const rates = TOKEN_RATES[model] || TOKEN_RATES['gpt-4o'];
        const cost = (inputTokens * rates.input / 1000) + (outputTokens * rates.output / 1000);
        
        this.monthlyUsage.tokens.input += inputTokens;
        this.monthlyUsage.tokens.output += outputTokens;
        this.monthlyUsage.cost += cost;
        this.monthlyUsage.requests++;
        
        this.dailyUsage.tokens.input += inputTokens;
        this.dailyUsage.tokens.output += outputTokens;
        this.dailyUsage.cost += cost;
        this.dailyUsage.requests++;
        
        return cost;
    }
    
    trackServiceUsage(service, units) {
        const rate = SERVICE_RATES[service];
        if (!rate) return 0;
        
        const cost = units * rate;
        
        // Update monthly usage
        if (service === 'voice_transcription' || service === 'voice_command') {
            this.monthlyUsage.services.voice.minutes += units;
        } else if (service.startsWith('gpu_')) {
            this.monthlyUsage.services.gpu.minutes += units;
        } else if (service === 'security_scan') {
            this.monthlyUsage.services.security.scans += units;
        } else if (service === 'agent_mode') {
            this.monthlyUsage.services.agent.tasks += units;
        }
        
        this.monthlyUsage.cost += cost;
        
        // Update daily usage
        if (service === 'voice_transcription' || service === 'voice_command') {
            this.dailyUsage.services.voice.minutes += units;
        } else if (service.startsWith('gpu_')) {
            this.dailyUsage.services.gpu.minutes += units;
        } else if (service === 'security_scan') {
            this.dailyUsage.services.security.scans += units;
        } else if (service === 'agent_mode') {
            this.dailyUsage.services.agent.tasks += units;
        }
        
        this.dailyUsage.cost += cost;
        
        return cost;
    }
    
    getTotalCost() {
        return this.monthlyUsage.cost;
    }
    
    getDailyCost() {
        return this.dailyUsage.cost;
    }
    
    isWithinBudget(budget) {
        return this.monthlyUsage.cost <= budget;
    }
    
    isWithinDailyLimit(dailyLimit) {
        return this.dailyUsage.cost <= dailyLimit;
    }
    
    getBillingCycle() {
        const now = new Date();
        return {
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };
    }
    
    getUserLimits() {
        // In production, fetch from user subscription plan
        return {
            monthlyBudget: 100, // $100 default
            dailyLimit: 10, // $10 default
            tokenLimit: 1000000, // 1M tokens
            gpuMinutes: 60 // 60 minutes
        };
    }
    
    resetDailyUsage() {
        const today = new Date().toISOString().split('T')[0];
        if (this.dailyUsage.date !== today) {
            this.dailyUsage = {
                date: today,
                tokens: { input: 0, output: 0 },
                services: {
                    voice: { minutes: 0 },
                    gpu: { minutes: 0 },
                    security: { scans: 0 },
                    agent: { tasks: 0 }
                },
                requests: 0,
                cost: 0
            };
        }
    }
    
    resetMonthlyUsage() {
        const now = new Date();
        if (now > this.billingCycle.end) {
            this.monthlyUsage = {
                tokens: { input: 0, output: 0 },
                services: {
                    voice: { minutes: 0 },
                    gpu: { minutes: 0 },
                    security: { scans: 0 },
                    agent: { tasks: 0 }
                },
                requests: 0,
                cost: 0
            };
            this.billingCycle = this.getBillingCycle();
        }
    }
}

// Middleware to track usage
const trackUsage = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        let tracker = userUsage.get(user.id);
        
        if (!tracker) {
            tracker = new UsageTracker(user.id);
            userUsage.set(user.id, tracker);
        }
        
        // Reset daily/monthly usage if needed
        tracker.resetDailyUsage();
        tracker.resetMonthlyUsage();
        
        // Check budget limits
        if (!tracker.isWithinBudget(tracker.limits.monthlyBudget)) {
            return res.status(429).json({ 
                error: 'Monthly budget exceeded',
                currentCost: tracker.getTotalCost(),
                budget: tracker.limits.monthlyBudget
            });
        }
        
        if (!tracker.isWithinDailyLimit(tracker.limits.dailyLimit)) {
            return res.status(429).json({ 
                error: 'Daily limit exceeded',
                currentCost: tracker.getDailyCost(),
                dailyLimit: tracker.limits.dailyLimit
            });
        }
        
        req.usageTracker = tracker;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// API Routes

// Track token usage
router.post('/track/tokens', trackUsage, (req, res) => {
    try {
        const { inputTokens, outputTokens, model } = req.body;
        
        const cost = req.usageTracker.trackTokenUsage(inputTokens, outputTokens, model);
        
        // Log billing event
        const billingEvent = {
            id: uuidv4(),
            userId: req.user.id,
            type: 'token_usage',
            model,
            inputTokens,
            outputTokens,
            cost,
            timestamp: new Date()
        };
        
        billingEvents.set(billingEvent.id, billingEvent);
        
        res.json({
            success: true,
            cost,
            totalCost: req.usageTracker.getTotalCost(),
            remainingBudget: req.usageTracker.limits.monthlyBudget - req.usageTracker.getTotalCost()
        });
    } catch (error) {
        console.error('Token tracking error:', error);
        res.status(500).json({ error: 'Failed to track token usage' });
    }
});

// Track service usage
router.post('/track/service', trackUsage, (req, res) => {
    try {
        const { service, units } = req.body;
        
        const cost = req.usageTracker.trackServiceUsage(service, units);
        
        // Log billing event
        const billingEvent = {
            id: uuidv4(),
            userId: req.user.id,
            type: 'service_usage',
            service,
            units,
            cost,
            timestamp: new Date()
        };
        
        billingEvents.set(billingEvent.id, billingEvent);
        
        res.json({
            success: true,
            cost,
            totalCost: req.usageTracker.getTotalCost(),
            remainingBudget: req.usageTracker.limits.monthlyBudget - req.usageTracker.getTotalCost()
        });
    } catch (error) {
        console.error('Service tracking error:', error);
        res.status(500).json({ error: 'Failed to track service usage' });
    }
});

// Get usage summary
router.get('/summary', trackUsage, (req, res) => {
    try {
        const usage = req.usageTracker;
        
        res.json({
            success: true,
            monthlyUsage: usage.monthlyUsage,
            dailyUsage: usage.dailyUsage,
            totalCost: usage.getTotalCost(),
            dailyCost: usage.getDailyCost(),
            remainingBudget: usage.limits.monthlyBudget - usage.getTotalCost(),
            billingCycle: usage.billingCycle,
            limits: usage.limits
        });
    } catch (error) {
        console.error('Usage summary error:', error);
        res.status(500).json({ error: 'Failed to get usage summary' });
    }
});

// Get billing history
router.get('/history', trackUsage, (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const userEvents = Array.from(billingEvents.values())
            .filter(event => event.userId === req.user.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(parseInt(offset), parseInt(offset) + parseInt(limit));
        
        res.json({
            success: true,
            events: userEvents,
            total: userEvents.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Billing history error:', error);
        res.status(500).json({ error: 'Failed to get billing history' });
    }
});

// Get cost optimization suggestions
router.get('/optimize', trackUsage, (req, res) => {
    try {
        const usage = req.usageTracker;
        const suggestions = [];
        
        // Analyze token usage patterns
        if (usage.monthlyUsage.tokens.input > 500000) {
            suggestions.push({
                type: 'model_optimization',
                message: 'Consider using GPT-4o mini for simple tasks to reduce costs by 80%',
                potentialSavings: (usage.monthlyUsage.tokens.input / 1000) * 0.0024
            });
        }
        
        // Analyze GPU usage
        if (usage.monthlyUsage.services.gpu.minutes > 30) {
            suggestions.push({
                type: 'gpu_optimization',
                message: 'GPU usage is high. Consider batching requests or using standard GPU tier',
                potentialSavings: (usage.monthlyUsage.services.gpu.minutes - 30) * 0.15
            });
        }
        
        // Analyze voice usage
        if (usage.monthlyUsage.services.voice.minutes > 60) {
            suggestions.push({
                type: 'voice_optimization',
                message: 'Voice usage is high. Consider using text commands when possible',
                potentialSavings: (usage.monthlyUsage.services.voice.minutes - 60) * 0.01
            });
        }
        
        res.json({
            success: true,
            suggestions,
            totalPotentialSavings: suggestions.reduce((sum, s) => sum + s.potentialSavings, 0)
        });
    } catch (error) {
        console.error('Optimization error:', error);
        res.status(500).json({ error: 'Failed to get optimization suggestions' });
    }
});

// Set budget limits
router.post('/limits', trackUsage, (req, res) => {
    try {
        const { monthlyBudget, dailyLimit, tokenLimit, gpuMinutes } = req.body;
        
        req.usageTracker.limits = {
            monthlyBudget: monthlyBudget || req.usageTracker.limits.monthlyBudget,
            dailyLimit: dailyLimit || req.usageTracker.limits.dailyLimit,
            tokenLimit: tokenLimit || req.usageTracker.limits.tokenLimit,
            gpuMinutes: gpuMinutes || req.usageTracker.limits.gpuMinutes
        };
        
        res.json({
            success: true,
            limits: req.usageTracker.limits
        });
    } catch (error) {
        console.error('Limits setting error:', error);
        res.status(500).json({ error: 'Failed to set limits' });
    }
});

// Get pricing information
router.get('/pricing', (req, res) => {
    try {
        res.json({
            success: true,
            tokenRates: TOKEN_RATES,
            serviceRates: SERVICE_RATES
        });
    } catch (error) {
        console.error('Pricing error:', error);
        res.status(500).json({ error: 'Failed to get pricing information' });
    }
});

// Estimate cost for a request
router.post('/estimate', (req, res) => {
    try {
        const { model, inputTokens, outputTokens, services } = req.body;
        
        let totalCost = 0;
        const breakdown = {};
        
        // Calculate token cost
        if (inputTokens && outputTokens && model) {
            const rates = TOKEN_RATES[model] || TOKEN_RATES['gpt-4o'];
            const tokenCost = (inputTokens * rates.input / 1000) + (outputTokens * rates.output / 1000);
            totalCost += tokenCost;
            breakdown.tokens = {
                model,
                inputTokens,
                outputTokens,
                cost: tokenCost
            };
        }
        
        // Calculate service costs
        if (services) {
            breakdown.services = {};
            for (const [service, units] of Object.entries(services)) {
                const rate = SERVICE_RATES[service];
                if (rate) {
                    const serviceCost = units * rate;
                    totalCost += serviceCost;
                    breakdown.services[service] = {
                        units,
                        cost: serviceCost
                    };
                }
            }
        }
        
        res.json({
            success: true,
            totalCost,
            breakdown
        });
    } catch (error) {
        console.error('Cost estimation error:', error);
        res.status(500).json({ error: 'Failed to estimate cost' });
    }
});

module.exports = router;
