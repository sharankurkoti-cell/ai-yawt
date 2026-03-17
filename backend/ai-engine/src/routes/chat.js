const express = require('express');
const router = express.Router();
const chatHandler = require('../chat/chatHandler');

router.post('/', chatHandler.handleChat);

module.exports = router;
