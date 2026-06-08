const express = require('express');
const AuthService = require('../services/AuthService');
const GraphService = require('../services/GraphService');

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

// GET /onedrive/folders
router.get('/folders', async (req, res, next) => {
  try {
    const session = getSessionOrFail(req, res);
    if (!session) return;

    const items = await GraphService.getRootFolders(session.accessToken);
    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
});

// GET /onedrive/folders/:folderId
router.get('/folders/:folderId', async (req, res, next) => {
  try {
    const session = getSessionOrFail(req, res);
    if (!session) return;

    const items = await GraphService.getFolderChildren(session.accessToken, req.params.folderId);
    res.status(200).json({ items });
  } catch (err) {
    next(err);
  }
});

// GET /onedrive/files
router.get('/files', async (req, res) => {
  // TODO: list files within a folder via GraphService
  res.status(501).json({ message: 'Not implemented' });
});

module.exports = router;
