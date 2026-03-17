const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

// AI Chat endpoint
router.post('/chat', auth, aiController.chat);

// Debug endpoint
router.post('/debug', auth, aiController.debug);

// Project generation endpoint
router.post('/generate-project', auth, aiController.generateProject);

// Repository analysis endpoint
router.post('/repo-analysis', auth, aiController.repoAnalysis);

module.exports = router;
