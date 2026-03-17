const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      id: req.user.userId,
      email: req.user.email,
      message: 'User profile endpoint ready'
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    res.json({ message: 'Profile updated', name });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user usage stats
router.get('/usage', auth, async (req, res) => {
  try {
    res.json({
      messagesUsed: 0,
      messagesLimit: 50,
      projectsGenerated: 0,
      projectsLimit: 3,
      debugAnalyses: 0,
      debugLimit: 10,
      plan: 'free'
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

module.exports = router;
