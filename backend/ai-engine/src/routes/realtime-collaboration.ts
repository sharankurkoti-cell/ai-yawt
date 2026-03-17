const express = require('express');
const router = express.Router();
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Store active collaboration sessions
const activeSessions = new Map();
const wsConnections = new Map();

// WebSocket server for real-time collaboration
const wss = new WebSocket.Server({ noServer: true });

// Initialize WebSocket server
function initializeWebSocketServer(server) {
    wss.server = server;
    
    wss.on('connection', (ws, req) => {
        const sessionId = req.url?.split('session=')[1];
        const userId = uuidv4();
        
        if (sessionId && activeSessions.has(sessionId)) {
            // Join existing session
            const session = activeSessions.get(sessionId);
            session.participants.push({
                id: userId,
                ws: ws,
                joinedAt: new Date(),
                cursor: { line: 0, column: 0 },
                selection: null
            });
            
            wsConnections.set(userId, ws);
            
            // Send session state to new participant
            ws.send(JSON.stringify({
                type: 'session-joined',
                sessionId,
                userId,
                participants: session.participants.map(p => ({
                    id: p.id,
                    joinedAt: p.joinedAt
                })),
                files: session.files,
                messages: session.messages
            }));
            
            // Notify other participants
            session.participants.forEach(participant => {
                if (participant.id !== userId && participant.ws.readyState === WebSocket.OPEN) {
                    participant.ws.send(JSON.stringify({
                        type: 'participant-joined',
                        userId,
                        participantCount: session.participants.length
                    }));
                }
            });
        }
        
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                handleMessage(sessionId, userId, data);
            } catch (error) {
                console.error('Invalid message format:', error);
            }
        });
        
        ws.on('close', () => {
            handleDisconnection(sessionId, userId);
        });
        
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            handleDisconnection(sessionId, userId);
        });
    });
}

function handleMessage(sessionId, userId, message) {
    const session = activeSessions.get(sessionId);
    if (!session) return;
    
    const participant = session.participants.find(p => p.id === userId);
    if (!participant) return;
    
    switch (message.type) {
        case 'cursor-move':
            participant.cursor = message.cursor;
            broadcastToSession(sessionId, userId, {
                type: 'cursor-update',
                userId,
                cursor: message.cursor
            }, userId);
            break;
            
        case 'selection-change':
            participant.selection = message.selection;
            broadcastToSession(sessionId, userId, {
                type: 'selection-update',
                userId,
                selection: message.selection
            }, userId);
            break;
            
        case 'text-change':
            handleTextChange(session, userId, message);
            break;
            
        case 'file-open':
            handleFileOpen(session, userId, message);
            break;
            
        case 'chat-message':
            handleChatMessage(session, userId, message);
            break;
            
        case 'voice-call':
            handleVoiceCall(session, userId, message);
            break;
            
        case 'screen-share':
            handleScreenShare(session, userId, message);
            break;
            
        case 'code-review':
            handleCodeReview(session, userId, message);
            break;
            
        case 'ai-assist':
            handleAIAssist(session, userId, message);
            break;
    }
}

function handleTextChange(session, userId, message) {
    const participant = session.participants.find(p => p.id === userId);
    if (!participant) return;
    
    const change = {
        type: 'text-change',
        userId,
        file: message.file,
        changes: message.changes,
        timestamp: new Date()
    };
    
    // Apply change to session state
    if (!session.files[message.file]) {
        session.files[message.file] = {
            content: '',
            lastModified: new Date(),
            modifiedBy: userId
        };
    }
    
    // Apply changes
    message.changes.forEach(change => {
        if (change.type === 'insert') {
            session.files[message.file].content = 
                session.files[message.file].content.slice(0, change.position) +
                change.text +
                session.files[message.file].content.slice(change.position);
        } else if (change.type === 'delete') {
            session.files[message.file].content = 
                session.files[message.file].content.slice(0, change.start) +
                session.files[message.file].content.slice(change.end);
        } else if (change.type === 'replace') {
            session.files[message.file].content = 
                session.files[message.file].content.slice(0, change.start) +
                change.text +
                session.files[message.file].content.slice(change.end);
        }
    });
    
    session.files[message.file].lastModified = new Date();
    session.files[message.file].modifiedBy = userId;
    
    // Broadcast to all participants
    broadcastToSession(sessionId, userId, change);
}

function handleFileOpen(session, userId, message) {
    if (!session.files[message.file]) {
        session.files[message.file] = {
            content: message.content || '',
            lastModified: new Date(),
            modifiedBy: userId
        };
    }
    
    broadcastToSession(sessionId, userId, {
        type: 'file-opened',
        userId,
        file: message.file,
        content: session.files[message.file].content
    });
}

function handleChatMessage(session, userId, message) {
    const chatMessage = {
        id: uuidv4(),
        userId,
        username: message.username,
        content: message.content,
        timestamp: new Date(),
        type: 'text'
    };
    
    session.messages.push(chatMessage);
    
    broadcastToSession(sessionId, userId, {
        type: 'chat-message',
        message: chatMessage
    });
}

function handleVoiceCall(session, userId, message) {
    const voiceCall = {
        id: uuidv4(),
        initiatedBy: userId,
        participants: [userId],
        status: 'initiated',
        startTime: new Date()
    };
    
    session.voiceCalls = session.voiceCalls || [];
    session.voiceCalls.push(voiceCall);
    
    broadcastToSession(sessionId, userId, {
        type: 'voice-call-started',
        call: voiceCall
    });
}

function handleScreenShare(session, userId, message) {
    const screenShare = {
        id: uuidv4(),
        sharedBy: userId,
        status: 'active',
        startTime: new Date(),
        streamUrl: message.streamUrl
    };
    
    session.screenShares = session.screenShares || [];
    session.screenShares.push(screenShare);
    
    broadcastToSession(sessionId, userId, {
        type: 'screen-share-started',
        share: screenShare
    });
}

function handleCodeReview(session, userId, message) {
    const codeReview = {
        id: uuidv4(),
        reviewerId: userId,
        file: message.file,
        line: message.line,
        comment: message.comment,
        type: message.type || 'suggestion',
        timestamp: new Date(),
        status: 'pending'
    };
    
    session.codeReviews = session.codeReviews || [];
    session.codeReviews.push(codeReview);
    
    broadcastToSession(sessionId, userId, {
        type: 'code-review-added',
        review: codeReview
    });
}

function handleAIAssist(session, userId, message) {
    // Use AI to assist with the request
    const aiRequest = {
        prompt: message.prompt,
        context: {
            files: session.files,
            messages: session.messages,
            participants: session.participants.length
        }
    };
    
    // This would integrate with your AI service
    // For now, simulate AI response
    setTimeout(() => {
        const aiResponse = {
            id: uuidv4(),
            userId: 'ai-assistant',
            content: `AI assistance for: ${message.prompt}`,
            timestamp: new Date(),
            type: 'ai-response'
        };
        
        session.messages.push(aiResponse);
        broadcastToSession(sessionId, 'ai-assistant', {
            type: 'ai-response',
            response: aiResponse
        });
    }, 1000);
}

function handleDisconnection(sessionId, userId) {
    const session = activeSessions.get(sessionId);
    if (!session) return;
    
    // Remove participant
    session.participants = session.participants.filter(p => p.id !== userId);
    wsConnections.delete(userId);
    
    // Notify remaining participants
    broadcastToSession(sessionId, userId, {
        type: 'participant-left',
        userId,
        participantCount: session.participants.length
    });
    
    // Clean up session if empty
    if (session.participants.length === 0) {
        activeSessions.delete(sessionId);
    }
}

function broadcastToSession(sessionId, senderId, message, excludeSender = null) {
    const session = activeSessions.get(sessionId);
    if (!session) return;
    
    const messageWithSender = {
        ...message,
        senderId,
        timestamp: new Date()
    };
    
    session.participants.forEach(participant => {
        if (participant.ws.readyState === WebSocket.OPEN && 
            participant.id !== excludeSender) {
            participant.ws.send(JSON.stringify(messageWithSender));
        }
    });
}

// REST API endpoints

// Create new collaboration session
router.post('/sessions', async (req, res) => {
    try {
        const { name, description, isPublic, maxParticipants } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const sessionId = uuidv4();
        
        const session = {
            id: sessionId,
            name,
            description,
            isPublic: isPublic || false,
            maxParticipants: maxParticipants || 10,
            createdBy: user.id,
            createdAt: new Date(),
            participants: [],
            files: {},
            messages: [],
            voiceCalls: [],
            screenShares: [],
            codeReviews: []
        };
        
        activeSessions.set(sessionId, session);
        
        res.json({
            success: true,
            sessionId,
            session
        });
    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// Join existing session
router.post('/sessions/:sessionId/join', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { username } = req.body;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const user = jwt.verify(token, process.env.JWT_SECRET);
        const session = activeSessions.get(sessionId);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        if (session.participants.length >= session.maxParticipants) {
            return res.status(403).json({ error: 'Session is full' });
        }
        
        res.json({
            success: true,
            sessionId,
            wsUrl: `ws://localhost:3002/collaboration/ws?session=${sessionId}`,
            session
        });
    } catch (error) {
        console.error('Session join error:', error);
        res.status(500).json({ error: 'Failed to join session' });
    }
});

// Get session info
router.get('/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = activeSessions.get(sessionId);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json({
            success: true,
            session
        });
    } catch (error) {
        console.error('Session info error:', error);
        res.status(500).json({ error: 'Failed to get session info' });
    }
});

// List active sessions
router.get('/sessions', async (req, res) => {
    try {
        const { isPublic } = req.query;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        jwt.verify(token, process.env.JWT_SECRET);
        
        let sessions = Array.from(activeSessions.values());
        
        if (isPublic !== undefined) {
            sessions = sessions.filter(s => s.isPublic === (isPublic === 'true'));
        }
        
        res.json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error('Sessions list error:', error);
        res.status(500).json({ error: 'Failed to list sessions' });
    }
});

module.exports = { router, initializeWebSocketServer };
