const express = require('express');
const AuthService = require('../services/AuthService');

const router = express.Router();

// GET /auth/microsoft/login
router.get('/microsoft/login', (req, res) => {
  const loginUrl = AuthService.getLoginUrl();
  res.redirect(loginUrl);
});

// GET /auth/microsoft/callback
router.get('/microsoft/callback', async (req, res, next) => {
  try {
    const { code, state, error, error_description: errorDescription } = req.query;

    if (error) {
      return res.status(400).json({ error, error_description: errorDescription });
    }
    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }
    if (!AuthService.isValidState(state)) {
      return res.status(400).json({ error: 'Invalid or expired state parameter' });
    }

    const { sessionId, profile } = await AuthService.handleCallback(code);

    res.status(200).json({ sessionId, profile });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
