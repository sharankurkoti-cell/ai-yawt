const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const multer = require('multer');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/fine-tuning/',
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Start fine-tuning job
router.post('/jobs', upload.single('dataset'), async (req, res) => {
    try {
        const { 
            modelName, 
            baseModel = 'gpt-3.5-turbo',
            trainingData,
            validationData,
            hyperparameters,
            organizationId
        } = req.body;
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        let datasetPath;
        if (req.file) {
            datasetPath = req.file.path;
        } else if (trainingData) {
            // Create dataset from provided data
            datasetPath = await createDatasetFile(trainingData, organizationId);
        } else {
            return res.status(400).json({ error: 'Training data is required' });
        }

        // Validate dataset format
        const validation = await validateDataset(datasetPath);
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: 'Invalid dataset format', 
                details: validation.errors 
            });
        }

        // Start fine-tuning job
        const fineTuningJob = await openai.fineTuning.jobs.create({
            training_file: await uploadTrainingFile(datasetPath),
            model: baseModel,
            hyperparameters: hyperparameters ? {
                batch_size: hyperparameters.batchSize,
                learning_rate_multiplier: hyperparameters.learningRateMultiplier,
                n_epochs: hyperparameters.epochs,
                weight_decay: hyperparameters.weightDecay
            } : undefined,
            suffix: `${organizationId}_${Date.now()}`
        });

        // Store job metadata
        const jobMetadata = {
            id: fineTuningJob.id,
            modelName,
            baseModel,
            organizationId,
            createdBy: user.id,
            createdAt: new Date(),
            status: fineTuningJob.status,
            hyperparameters,
            datasetPath
        };

        // Store in database (in production)
        storeJobMetadata(jobMetadata);

        res.json({
            jobId: fineTuningJob.id,
            status: fineTuningJob.status,
            estimatedCompletion: fineTuningJob.estimated_finish,
            modelName,
            baseModel
        });
    } catch (error) {
        console.error('Fine-tuning job creation error:', error);
        res.status(500).json({ error: 'Failed to create fine-tuning job' });
    }
});

// Get fine-tuning job status
router.get('/jobs/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get job status from OpenAI
        const job = await openai.fineTuning.jobs.retrieve(jobId);
        
        // Get additional metadata from storage
        const jobMetadata = getJobMetadata(jobId);
        
        // If job is completed, store model info
        if (job.status === 'succeeded' && job.fine_tuned_model) {
            await storeCustomModel({
                id: job.fine_tuned_model,
                jobId: job.id,
                organizationId: jobMetadata.organizationId,
                modelName: jobMetadata.modelName,
                baseModel: jobMetadata.baseModel,
                createdBy: jobMetadata.createdBy,
                createdAt: new Date(),
                metrics: job.trained_tokens ? {
                    trainingTokens: job.trained_tokens,
                    validationLoss: job.result?.validation_loss,
                    trainingLoss: job.result?.training_loss
                } : null
            });
        }

        res.json({
            id: job.id,
            status: job.status,
            model: job.fine_tuned_model,
            createdAt: job.created_at,
            finishedAt: job.finished_at,
            trainedTokens: job.trained_tokens,
            validationLoss: job.result?.validation_loss,
            trainingLoss: job.result?.training_loss,
            metadata: jobMetadata
        });
    } catch (error) {
        console.error('Job status retrieval error:', error);
        res.status(500).json({ error: 'Failed to retrieve job status' });
    }
});

// List fine-tuning jobs
router.get('/jobs', async (req, res) => {
    try {
        const { 
            organizationId, 
            status, 
            limit = 20, 
            offset = 0 
        } = req.query;
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        // List jobs from OpenAI
        const jobs = await openai.fineTuning.jobs.list({
            limit: parseInt(limit)
        });

        // Filter by organization and status if provided
        let filteredJobs = jobs.data;
        
        if (organizationId) {
            filteredJobs = filteredJobs.filter(job => {
                const metadata = getJobMetadata(job.id);
                return metadata.organizationId === organizationId;
            });
        }
        
        if (status) {
            filteredJobs = filteredJobs.filter(job => job.status === status);
        }

        // Add metadata
        const jobsWithMetadata = filteredJobs.map(job => ({
            ...job,
            metadata: getJobMetadata(job.id)
        }));

        res.json({
            jobs: jobsWithMetadata.slice(parseInt(offset), parseInt(offset) + parseInt(limit)),
            total: filteredJobs.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Jobs listing error:', error);
        res.status(500).json({ error: 'Failed to list jobs' });
    }
});

// Cancel fine-tuning job
router.post('/jobs/:jobId/cancel', async (req, res) => {
    try {
        const { jobId } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check permissions
        const jobMetadata = getJobMetadata(jobId);
        if (!jobMetadata || jobMetadata.createdBy !== user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Cancel job
        const cancelledJob = await openai.fineTuning.jobs.cancel(jobId);

        res.json({
            jobId: cancelledJob.id,
            status: cancelledJob.status,
            message: 'Job cancellation requested'
        });
    } catch (error) {
        console.error('Job cancellation error:', error);
        res.status(500).json({ error: 'Failed to cancel job' });
    }
});

// List custom models
router.get('/models', async (req, res) => {
    try {
        const { organizationId } = req.query;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get custom models from storage
        const customModels = getCustomModels(organizationId);
        
        // Get model details from OpenAI
        const modelsWithDetails = await Promise.all(
            customModels.map(async (model) => {
                try {
                    const modelDetails = await openai.models.retrieve(model.id);
                    return {
                        ...model,
                        details: modelDetails
                    };
                } catch (error) {
                    return {
                        ...model,
                        details: null,
                        error: error.message
                    };
                }
            })
        );

        res.json({
            models: modelsWithDetails,
            total: modelsWithDetails.length
        });
    } catch (error) {
        console.error('Models listing error:', error);
        res.status(500).json({ error: 'Failed to list custom models' });
    }
});

// Delete custom model
router.delete('/models/:modelId', async (req, res) => {
    try {
        const { modelId } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check permissions
        const model = getCustomModel(modelId);
        if (!model || model.createdBy !== user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Delete model from OpenAI
        await openai.models.del(modelId);
        
        // Remove from storage
        deleteCustomModel(modelId);

        res.json({
            success: true,
            message: 'Model deleted successfully'
        });
    } catch (error) {
        console.error('Model deletion error:', error);
        res.status(500).json({ error: 'Failed to delete model' });
    }
});

// Test custom model
router.post('/models/:modelId/test', async (req, res) => {
    try {
        const { modelId } = req.params;
        const { prompt, maxTokens = 100, temperature = 0.7 } = req.body;
        
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check permissions
        const model = getCustomModel(modelId);
        if (!model || model.organizationId !== user.organizationId) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Test model
        const completion = await openai.chat.completions.create({
            model: modelId,
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: maxTokens,
            temperature: temperature
        });

        res.json({
            modelId,
            prompt,
            response: completion.choices[0].message.content,
            usage: completion.usage,
            testAt: new Date()
        });
    } catch (error) {
        console.error('Model test error:', error);
        res.status(500).json({ error: 'Failed to test model' });
    }
});

// Dataset validation
router.post('/datasets/validate', upload.single('dataset'), async (req, res) => {
    try {
        const datasetPath = req.file ? req.file.path : null;
        const { trainingData } = req.body;
        
        let dataToValidate;
        if (datasetPath) {
            const content = fs.readFileSync(datasetPath, 'utf8');
            dataToValidate = JSON.parse(content);
        } else if (trainingData) {
            dataToValidate = JSON.parse(trainingData);
        } else {
            return res.status(400).json({ error: 'Dataset is required' });
        }

        const validation = await validateDatasetFormat(dataToValidate);
        
        res.json(validation);
    } catch (error) {
        console.error('Dataset validation error:', error);
        res.status(500).json({ error: 'Failed to validate dataset' });
    }
});

// Helper functions
async function createDatasetFile(trainingData, organizationId) {
    const dataset = JSON.parse(trainingData);
    const filename = `dataset_${organizationId}_${Date.now()}.jsonl`;
    const filepath = path.join('uploads/datasets', filename);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    
    // Write dataset in JSONL format
    const jsonlContent = dataset.map(item => JSON.stringify(item)).join('\n');
    fs.writeFileSync(filepath, jsonlContent);
    
    return filepath;
}

async function uploadTrainingFile(datasetPath) {
    const file = await openai.files.create({
        file: fs.createReadStream(datasetPath),
        purpose: 'fine-tune'
    });
    
    return file.id;
}

async function validateDataset(datasetPath) {
    try {
        const content = fs.readFileSync(datasetPath, 'utf8');
        const lines = content.trim().split('\n');
        
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            totalLines: lines.length,
            validLines: 0
        };
        
        for (let i = 0; i < lines.length; i++) {
            try {
                const entry = JSON.parse(lines[i]);
                if (!validateDatasetEntry(entry)) {
                    validation.errors.push(`Line ${i + 1}: Invalid entry format`);
                } else {
                    validation.validLines++;
                }
            } catch (error) {
                validation.errors.push(`Line ${i + 1}: Invalid JSON - ${error.message}`);
            }
        }
        
        if (validation.errors.length > 0) {
            validation.isValid = false;
        }
        
        if (validation.validLines < 10) {
            validation.warnings.push('Dataset has fewer than 10 valid training examples');
        }
        
        return validation;
    } catch (error) {
        return {
            isValid: false,
            errors: [`Failed to read dataset: ${error.message}`],
            warnings: [],
            totalLines: 0,
            validLines: 0
        };
    }
}

function validateDatasetEntry(entry) {
    return (
        entry &&
        typeof entry === 'object' &&
        entry.messages &&
        Array.isArray(entry.messages) &&
        entry.messages.length >= 2 &&
        entry.messages[0].role === 'user' &&
        entry.messages[entry.messages.length - 1].role === 'assistant' &&
        entry.messages.every(msg => msg.role && msg.content)
    );
}

function storeJobMetadata(metadata) {
    // In production, store in database
    const metadataFile = `metadata/jobs/${metadata.id}.json`;
    fs.mkdirSync(path.dirname(metadataFile), { recursive: true });
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
}

function getJobMetadata(jobId) {
    // In production, fetch from database
    try {
        const metadataFile = `metadata/jobs/${jobId}.json`;
        if (fs.existsSync(metadataFile)) {
            return JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading job metadata:', error);
    }
    return {};
}

function storeCustomModel(model) {
    // In production, store in database
    const modelFile = `metadata/models/${model.id}.json`;
    fs.mkdirSync(path.dirname(modelFile), { recursive: true });
    fs.writeFileSync(modelFile, JSON.stringify(model, null, 2));
}

function getCustomModels(organizationId) {
    // In production, fetch from database
    try {
        const modelsDir = 'metadata/models';
        if (!fs.existsSync(modelsDir)) {
            return [];
        }
        
        const modelFiles = fs.readdirSync(modelsDir);
        const models = [];
        
        for (const file of modelFiles) {
            try {
                const model = JSON.parse(fs.readFileSync(path.join(modelsDir, file), 'utf8'));
                if (!organizationId || model.organizationId === organizationId) {
                    models.push(model);
                }
            } catch (error) {
                console.error(`Error reading model file ${file}:`, error);
            }
        }
        
        return models;
    } catch (error) {
        console.error('Error reading custom models:', error);
        return [];
    }
}

function getCustomModel(modelId) {
    // In production, fetch from database
    try {
        const modelFile = `metadata/models/${modelId}.json`;
        if (fs.existsSync(modelFile)) {
            return JSON.parse(fs.readFileSync(modelFile, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading custom model:', error);
    }
    return null;
}

function deleteCustomModel(modelId) {
    // In production, delete from database
    try {
        const modelFile = `metadata/models/${modelId}.json`;
        if (fs.existsSync(modelFile)) {
            fs.unlinkSync(modelFile);
        }
    } catch (error) {
        console.error('Error deleting custom model:', error);
    }
}

async function validateDatasetFormat(data) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        totalEntries: Array.isArray(data) ? data.length : 0,
        validEntries: 0
    };
    
    if (!Array.isArray(data)) {
        validation.isValid = false;
        validation.errors.push('Dataset must be an array');
        return validation;
    }
    
    for (let i = 0; i < data.length; i++) {
        if (validateDatasetEntry(data[i])) {
            validation.validEntries++;
        } else {
            validation.errors.push(`Entry ${i + 1}: Invalid format`);
        }
    }
    
    if (validation.errors.length > 0) {
        validation.isValid = false;
    }
    
    if (validation.validEntries < 10) {
        validation.warnings.push('Dataset has fewer than 10 valid training examples');
    }
    
    return validation;
}

module.exports = router;
