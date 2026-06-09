const express = require('express');
const path = require('path');
const AuthService = require('../services/AuthService');
const FirestoreService = require('../services/FirestoreService');
const StorageService = require('../services/StorageService');

const router = express.Router();

// ── Auth helper ──────────────────────────────────────────────────
function sessionOrFail(req, res) {
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

// ── GET /restore/file/:backupId/:fileId ──────────────────────────
// Must be declared before /:backupId so Express does not consume "file" as a
// backupId value.
//
// Looks up the backup in Firestore, finds the matching file entry by fileId,
// streams the GCS object to the browser as a file attachment.
router.get('/file/:backupId/:fileId', async (req, res, next) => {
  try {
    if (!sessionOrFail(req, res)) return;

    const { backupId, fileId } = req.params;

    const backup = await FirestoreService.getBackupById(backupId);
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const fileEntry = (backup.files || []).find((f) => f.fileId === fileId);
    if (!fileEntry) {
      return res.status(404).json({ error: 'File not found in this backup' });
    }

    const filename = fileEntry.name || fileId;
    const gcsPath  = fileEntry.gcsPath;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const readStream = StorageService.createReadStream(gcsPath);

    readStream.on('error', (err) => {
      // If headers have not been sent yet we can still return a JSON error;
      // otherwise just close the connection.
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to read file from storage' });
      } else {
        res.end();
      }
      next(err);
    });

    readStream.pipe(res);
  } catch (err) {
    next(err);
  }
});

// ── GET /restore/:backupId ────────────────────────────────────────
// Returns backup metadata. Unchanged from previous implementation.
router.get('/:backupId', async (req, res, next) => {
  try {
    if (!sessionOrFail(req, res)) return;

    const backup = await FirestoreService.getBackupById(req.params.backupId);
    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    res.status(200).json({
      backupId:   backup.backupId,
      backupDate: backup.createdAt,
      files:      backup.files || [],
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
