const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /onedrive/folders
router.get('/folders', requireAuth, (req, res) => {
  // TODO: list OneDrive folders via GraphService
  res.status(501).json({ message: 'Not implemented' });
});

// GET /onedrive/files
router.get('/files', requireAuth, (req, res) => {
  // TODO: list files within a folder via GraphService
  res.status(501).json({ message: 'Not implemented' });
});

module.exports = router;
