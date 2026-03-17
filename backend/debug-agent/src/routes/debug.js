const express = require('express');
const router = express.Router();
const debugHandler = require('../handlers/debugHandler');

router.post('/analyze', debugHandler.analyzeError);
router.post('/fix', debugHandler.generateFix);
router.post('/improve', debugHandler.improveCode);

module.exports = router;
