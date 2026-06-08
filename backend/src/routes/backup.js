const express = require('express');
const AuthService = require('../services/AuthService');
const BackupService = require('../services/BackupService');

const router = express.Router();

function getSessionOrFail(req, res) {
  const sessionId = req.header('x-session-id');
  if (!sessionId) {
    res.status(401).json({ error: 'Missing x-session-id header' });
    return null;
  }

  const session = AuthService.getSession(sessionId);
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return null;
  }

  return session;
}

// POST /backup/start
router.post('/start', async (req, res, next) => {
  try {
    const session = getSessionOrFail(req, res);
    if (!session) return;

    const { folderId } = req.body || {};
    if (!folderId) {
      return res.status(400).json({ error: 'folderId is required' });
    }

    const result = await BackupService.startBackup(session, folderId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// GET /backup/history
router.get('/history', async (req, res) => {
  // TODO: fetch backup history via FirestoreService
  res.status(501).json({ message: 'Not implemented' });
});

module.exports = router;
