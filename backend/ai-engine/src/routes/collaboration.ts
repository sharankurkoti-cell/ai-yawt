const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage for collaboration sessions (in production, use Redis/Database)
const activeSessions = new Map();
const userSessions = new Map();
const collaborationHistory = new Map();

// WebSocket server for real-time collaboration
const wss = new WebSocket.Server({ noServer: true });

// Create collaboration session
router.post('/sessions', async (req, res) => {
    try {
        const { name, description, repository, participants, settings } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        
        const sessionId = generateSessionId();
        const session = {
            id: sessionId,
            name,
            description,
            repository,
            owner: user.id,
            participants: [user.id, ...(participants || [])],
            settings: {
                allowAnonymous: false,
                requireApproval: true,
                maxParticipants: 10,
                ...settings
            },
            createdAt: new Date(),
            isActive: true,
            messages: [],
            codeChanges: [],
            sharedContext: {}
        };

        activeSessions.set(sessionId, session);
        userSessions.set(user.id, sessionId);

        res.json({
            session,
            joinUrl: `${process.env.FRONTEND_URL}/collaboration/${sessionId}`
        });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Failed to create collaboration session' });
    }
});

// Join collaboration session
router.post('/sessions/:sessionId/join', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { participantId } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        const session = activeSessions.get(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.participants.length >= session.settings.maxParticipants) {
            return res.status(400).json({ error: 'Session is full' });
        }

        if (!session.participants.includes(user.id)) {
            session.participants.push(user.id);
        }

        userSessions.set(user.id, sessionId);

        // Notify other participants
        broadcastToSession(sessionId, {
            type: 'user_joined',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            timestamp: new Date()
        });

        res.json({
            session,
            participants: await getSessionParticipants(session.participants)
        });
    } catch (error) {
        console.error('Join session error:', error);
        res.status(500).json({ error: 'Failed to join session' });
    }
});

// Send message in collaboration session
router.post('/sessions/:sessionId/messages', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { content, type = 'text', metadata } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        const session = activeSessions.get(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (!session.participants.includes(user.id)) {
            return res.status(403).json({ error: 'Not a participant in this session' });
        }

        const message = {
            id: generateMessageId(),
            content,
            type,
            sender: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            timestamp: new Date(),
            metadata
        };

        session.messages.push(message);

        // Broadcast to all participants
        broadcastToSession(sessionId, {
            type: 'new_message',
            message
        });

        // AI response if needed
        if (type === 'question' || content.includes('@yawtai')) {
            const aiResponse = await generateAIResponse(content, session.sharedContext);
            const aiMessage = {
                id: generateMessageId(),
                content: aiResponse,
                type: 'ai_response',
                sender: {
                    id: 'yawtai',
                    name: 'YawtAI',
                    email: 'ai@yawtai.com'
                },
                timestamp: new Date()
            };

            session.messages.push(aiMessage);
            broadcastToSession(sessionId, {
                type: 'new_message',
                message: aiMessage
            });
        }

        res.json({ message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Share code context
router.post('/sessions/:sessionId/context', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { code, language, filePath, description } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        const session = activeSessions.get(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const contextId = generateContextId();
        const context = {
            id: contextId,
            code,
            language,
            filePath,
            description,
            sharedBy: user.id,
            timestamp: new Date()
        };

        session.sharedContext[contextId] = context;

        // Broadcast to all participants
        broadcastToSession(sessionId, {
            type: 'context_shared',
            context
        });

        res.json({ context });
    } catch (error) {
        console.error('Share context error:', error);
        res.status(500).json({ error: 'Failed to share context' });
    }
});

// Code review collaboration
router.post('/sessions/:sessionId/reviews', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { code, language, reviewType = 'general' } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        const session = activeSessions.get(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // AI-powered code review
        const review = await generateCodeReview(code, language, session.sharedContext);
        
        const reviewData = {
            id: generateReviewId(),
            code,
            language,
            reviewType,
            review,
            requestedBy: user.id,
            timestamp: new Date()
        };

        // Store review (in production, use database)
        if (!session.reviews) {
            session.reviews = [];
        }
        session.reviews.push(reviewData);

        // Broadcast to all participants
        broadcastToSession(sessionId, {
            type: 'code_review_completed',
            review: reviewData
        });

        res.json({ review: reviewData });
    } catch (error) {
        console.error('Code review error:', error);
        res.status(500).json({ error: 'Failed to perform code review' });
    }
});

// Get session history
router.get('/sessions/:sessionId/history', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        const session = activeSessions.get(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (!session.participants.includes(user.id)) {
            return res.status(403).json({ error: 'Not a participant in this session' });
        }

        res.json({
            messages: session.messages,
            codeChanges: session.codeChanges || [],
            reviews: session.reviews || [],
            sharedContext: Object.values(session.sharedContext)
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get session history' });
    }
});

// Get active sessions for user
router.get('/sessions/active', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        const userSessionId = userSessions.get(user.id);
        
        if (!userSessionId) {
            return res.json({ sessions: [] });
        }

        const session = activeSessions.get(userSessionId);
        
        res.json({
            sessions: session ? [session] : []
        });
    } catch (error) {
        console.error('Get active sessions error:', error);
        res.status(500).json({ error: 'Failed to get active sessions' });
    }
});

// Leave collaboration session
router.post('/sessions/:sessionId/leave', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        const session = activeSessions.get(sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Remove user from participants
        session.participants = session.participants.filter(id => id !== user.id);
        userSessions.delete(user.id);

        // Notify other participants
        broadcastToSession(sessionId, {
            type: 'user_left',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            timestamp: new Date()
        });

        // If session is empty, deactivate it
        if (session.participants.length === 0) {
            session.isActive = false;
            activeSessions.delete(sessionId);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Leave session error:', error);
        res.status(500).json({ error: 'Failed to leave session' });
    }
});

// Helper functions
function generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9);
}

function generateMessageId() {
    return 'msg_' + Math.random().toString(36).substr(2, 9);
}

function generateContextId() {
    return 'ctx_' + Math.random().toString(36).substr(2, 9);
}

function generateReviewId() {
    return 'rev_' + Math.random().toString(36).substr(2, 9);
}

async function getSessionParticipants(participantIds) {
    // In production, fetch from database
    return participantIds.map(id => ({
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
        isOnline: Math.random() > 0.5
    }));
}

function broadcastToSession(sessionId, message) {
    // In production, use proper WebSocket broadcasting
    console.log(`Broadcasting to session ${sessionId}:`, message);
}

async function generateAIResponse(message, context) {
    try {
        const contextString = Object.values(context)
            .map(ctx => `File: ${ctx.filePath}\n${ctx.code}`)
            .join('\n\n');

        const systemPrompt = `You are an AI assistant in a collaborative coding session. 
        Help the team with their coding questions and provide helpful suggestions.
        
        Shared Context:
        ${contextString || 'No shared context available'}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            max_tokens: 1000,
            temperature: 0.3
        });

        return completion.choices[0]?.message.content || 'I apologize, but I cannot provide a response at this time.';
    } catch (error) {
        console.error('AI response generation error:', error);
        return 'I encountered an error while generating a response.';
    }
}

async function generateCodeReview(code, language, context) {
    try {
        const contextString = Object.values(context)
            .map(ctx => `File: ${ctx.filePath}\n${ctx.code}`)
            .join('\n\n');

        const systemPrompt = `You are an expert code reviewer. Analyze the following ${language} code and provide a comprehensive review.
        
        Consider:
        - Code quality and best practices
        - Potential bugs or issues
        - Performance optimizations
        - Security concerns
        - Code readability and maintainability
        
        Context:
        ${contextString || 'No additional context available'}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Review this code:\n\n${code}` }
            ],
            max_tokens: 2000,
            temperature: 0.2
        });

        return {
            summary: completion.choices[0]?.message.content || 'Review completed.',
            issues: [],
            suggestions: [],
            score: 85
        };
    } catch (error) {
        console.error('Code review generation error:', error);
        return {
            summary: 'Review failed due to an error.',
            issues: [],
            suggestions: [],
            score: 0
        };
    }
}

module.exports = router;
