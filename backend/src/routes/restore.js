const express = require('express');
const AuthService = require('../services/AuthService');
const FirestoreService = require('../services/FirestoreService');

const router = express.Router();

// GET /restore/:backupId
router.get('/:backupId', async (req, res, next) => {
  try {
    const sessionId = req.header('x-session-id');
    if (!sessionId) {
      return res.status(401).json({ error: 'Missing x-session-id header' });
    }
    if (!AuthService.getSession(sessionId)) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const backup = await FirestoreService.getBackupById(req.params.backupId);
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    res.status(200).json({
      backupId: backup.backupId,
      backupDate: backup.createdAt,
      files: backup.files || [],
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
