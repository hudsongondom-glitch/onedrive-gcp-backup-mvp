const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /restore/:backupId
router.get('/:backupId', requireAuth, (req, res) => {
  // TODO: fetch backup and return download/restore info via BackupService
  res.status(501).json({ message: 'Not implemented' });
});

module.exports = router;
