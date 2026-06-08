const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /backup/start
router.post('/start', requireAuth, (req, res) => {
  // TODO: trigger BackupService.startBackup
  res.status(501).json({ message: 'Not implemented' });
});

// GET /backup/history
router.get('/history', requireAuth, (req, res) => {
  // TODO: fetch backup history via FirestoreService
  res.status(501).json({ message: 'Not implemented' });
});

module.exports = router;
