const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', auth, authController.logout);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Get current user
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;
