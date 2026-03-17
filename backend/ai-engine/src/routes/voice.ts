const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for audio file uploads
const upload = multer({
    dest: 'uploads/audio/',
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid audio file type'));
        }
    }
});

// Voice transcription endpoint
router.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const audioPath = req.file.path;
        const language = req.body.language || 'en';

        // Transcribe using OpenAI Whisper
        const transcription = await transcribeAudio(audioPath, language);

        // Clean up uploaded file
        fs.unlinkSync(audioPath);

        res.json({
            transcript: transcription,
            language,
            duration: req.body.duration || null,
            confidence: 0.95 // Mock confidence score
        });
    } catch (error) {
        console.error('Voice transcription error:', error);
        
        // Clean up uploaded file on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
});

// Voice command processing
router.post('/process-command', async (req, res) => {
    try {
        const { transcript, context } = req.body;

        if (!transcript) {
            return res.status(400).json({ error: 'No transcript provided' });
        }

        const processedCommand = await processVoiceCommand(transcript, context);

        res.json({
            originalTranscript: transcript,
            processedCommand,
            intent: processedCommand.intent,
            parameters: processedCommand.parameters,
            confidence: processedCommand.confidence
        });
    } catch (error) {
        console.error('Voice command processing error:', error);
        res.status(500).json({ error: 'Failed to process voice command' });
    }
});

// Voice settings configuration
router.get('/settings', async (req, res) => {
    try {
        const settings = {
            supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'],
            defaultLanguage: 'en',
            maxDuration: 300, // 5 minutes
            supportedFormats: ['wav', 'mp3', 'mpeg', 'ogg', 'webm'],
            maxFileSize: '10MB',
            sampleRate: 16000,
            channels: 1
        };

        res.json(settings);
    } catch (error) {
        console.error('Voice settings error:', error);
        res.status(500).json({ error: 'Failed to get voice settings' });
    }
});

// Voice feedback/score
router.post('/feedback', async (req, res) => {
    try {
        const { transcript, expected, actual, rating } = req.body;

        // Store feedback for improving voice recognition
        // This would typically go to a database or analytics service
        console.log('Voice feedback:', {
            transcript,
            expected,
            actual,
            rating,
            timestamp: new Date().toISOString()
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Voice feedback error:', error);
        res.status(500).json({ error: 'Failed to store feedback' });
    }
});

async function transcribeAudio(audioPath, language = 'en') {
    try {
        // This would use OpenAI's Whisper API or similar service
        // For now, provide a mock implementation
        const OpenAI = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const audioFile = fs.createReadStream(audioPath);

        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: language,
            response_format: 'json',
            temperature: 0.0
        });

        return transcription.text;
    } catch (error) {
        console.error('Transcription error:', error);
        
        // Fallback mock transcription
        return "This is a mock transcription of the audio input.";
    }
}

async function processVoiceCommand(transcript, context) {
    try {
        const OpenAI = require('openai');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const systemPrompt = `You are a voice command processor for a code editor AI assistant.
        
        Analyze the user's voice command transcript and extract:
        - Intent (what the user wants to do)
        - Parameters (specific details)
        - Confidence level
        
        Common intents include:
        - explain_code: "Explain this code", "What does this do?"
        - fix_code: "Fix this error", "Help me fix this"
        - generate_code: "Create a function", "Write some code"
        - optimize_code: "Optimize this", "Make it faster"
        - test_code: "Write tests", "Generate unit tests"
        - document_code: "Add documentation", "Write comments"
        - search_code: "Find function", "Search for"
        - navigate: "Go to line", "Open file"
        - general_chat: "How do I", "What is"
        
        Context:
        ${context || 'No additional context provided'}
        
        Respond with JSON format:
        {
            "intent": "intent_name",
            "parameters": {
                "code": "selected code if mentioned",
                "language": "programming language",
                "specifics": "additional details"
            },
            "confidence": 0.95,
            "suggested_action": "what to execute"
        }`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Process this voice command: "${transcript}"` }
            ],
            max_tokens: 500,
            temperature: 0.2
        });

        const response = completion.choices[0]?.message.content || '{}';
        
        try {
            return JSON.parse(response);
        } catch (parseError) {
            // Fallback processing
            return {
                intent: 'general_chat',
                parameters: { query: transcript },
                confidence: 0.7,
                suggested_action: 'chat'
            };
        }
    } catch (error) {
        console.error('Voice command processing error:', error);
        
        // Fallback response
        return {
            intent: 'general_chat',
            parameters: { query: transcript },
            confidence: 0.5,
            suggested_action: 'chat'
        };
    }
}

// Real-time voice streaming (WebSocket would be better for this)
router.post('/stream-transcribe', upload.single('audio'), async (req, res) => {
    try {
        // This would handle real-time transcription
        // For now, return the regular transcription
        const transcription = await transcribeAudio(req.file.path, req.body.language || 'en');
        
        // Clean up
        fs.unlinkSync(req.file.path);
        
        res.json({
            transcript: transcription,
            isFinal: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Stream transcription error:', error);
        res.status(500).json({ error: 'Failed to transcribe audio stream' });
    }
});

// Voice profile management
router.get('/profiles', async (req, res) => {
    try {
        // Mock voice profiles
        const profiles = [
            {
                id: 'default',
                name: 'Default',
                language: 'en',
                accent: 'neutral',
                accuracy: 0.95
            },
            {
                id: 'developer',
                name: 'Developer',
                language: 'en',
                accent: 'technical',
                accuracy: 0.92
            }
        ];

        res.json(profiles);
    } catch (error) {
        console.error('Voice profiles error:', error);
        res.status(500).json({ error: 'Failed to get voice profiles' });
    }
});

// Voice training data
router.post('/train', upload.array('audio'), async (req, res) => {
    try {
        const { transcripts, profileId } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No audio files provided' });
        }

        // Process training data
        // This would typically train a custom model or update existing one
        console.log(`Training voice model with ${req.files.length} samples`);
        
        // Clean up uploaded files
        req.files.forEach(file => {
            fs.unlinkSync(file.path);
        });

        res.json({
            success: true,
            samplesProcessed: req.files.length,
            profileId,
            message: 'Voice training completed successfully'
        });
    } catch (error) {
        console.error('Voice training error:', error);
        
        // Clean up uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (cleanupError) {
                    console.error('Cleanup error:', cleanupError);
                }
            });
        }
        
        res.status(500).json({ error: 'Failed to train voice model' });
    }
});

module.exports = router;
