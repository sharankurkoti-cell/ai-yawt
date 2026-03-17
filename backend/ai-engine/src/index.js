const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const chatRoutes = require('./routes/chat');
const generationRoutes = require('./routes/generation');
const debugRoutes = require('./routes/debug');
const repoAnalysisRoutes = require('./routes/repo-analysis');
const securityRoutes = require('./routes/security');
const voiceRoutes = require('./routes/voice');
const collaborationRoutes = require('./routes/collaboration');
const searchRoutes = require('./routes/search');
const enterpriseRoutes = require('./routes/enterprise');
const fineTuningRoutes = require('./routes/fine-tuning');
const agentModeRoutes = require('./routes/agentMode');
const realtimeCollaborationRoutes = require('./routes/realtime-collaboration');
const performanceOptimizationRoutes = require('./routes/performance-optimization');
const billingUsageRoutes = require('./routes/billing-usage');
const modelRegistryRoutes = require('./routes/model-registry');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/chat', chatRoutes);
app.use('/generation', generationRoutes);
app.use('/debug', debugRoutes);
app.use('/repo-analysis', repoAnalysisRoutes);
app.use('/security', securityRoutes);
app.use('/voice', voiceRoutes);
app.use('/collaboration', collaborationRoutes);
app.use('/search', searchRoutes);
app.use('/enterprise', enterpriseRoutes);
app.use('/fine-tuning', fineTuningRoutes);
app.use('/agent-mode', agentModeRoutes);
app.use('/realtime-collaboration', realtimeCollaborationRoutes);
app.use('/performance-optimization', performanceOptimizationRoutes);
app.use('/billing', billingUsageRoutes);
app.use('/models', modelRegistryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'YawtAI Engine'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong in AI Engine!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🧠 YawtAI Engine running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
