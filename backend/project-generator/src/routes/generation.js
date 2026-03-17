const express = require('express');
const router = express.Router();
const generationHandler = require('../handlers/generationHandler');

router.post('/generate', generationHandler.generateProject);
router.post('/templates', generationHandler.getTemplates);
router.post('/download', generationHandler.downloadProject);

module.exports = router;
