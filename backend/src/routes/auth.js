const express = require('express');

const router = express.Router();

// GET /auth/microsoft/login
router.get('/microsoft/login', (req, res) => {
  // TODO: redirect to Microsoft OAuth 2.0 authorization endpoint via AuthService
  res.status(501).json({ message: 'Not implemented' });
});

// GET /auth/microsoft/callback
router.get('/microsoft/callback', (req, res) => {
  // TODO: exchange auth code for tokens via AuthService
  res.status(501).json({ message: 'Not implemented' });
});

module.exports = router;
