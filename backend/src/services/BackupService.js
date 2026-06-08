const crypto = require('crypto');

const GraphService = require('./GraphService');
const StorageService = require('./StorageService');
const FirestoreService = require('./FirestoreService');
const jobLogger = require('../utils/jobLogger');

// Orchestrates a backup run: pulls files via GraphService, uploads them via
// StorageService, and records metadata via FirestoreService.
//
// Logging note: each step's *actual* response is mirrored into jobLogger so
// that a job can be inspected after the fact (useful when the final summary
// looks vague, e.g. "filesBackedUp: 0" — was that because the folder was
// empty, or did every download/upload silently no-op?). Logging is purely
// observational — it never changes control flow or the returned result, and
// any logging error is swallowed so it can't affect the backup itself.

function safeLog(fn) {
  try {
    fn();
  } catch (_err) {
    // intentionally ignored — logging must never break the backup flow
  }
}

class BackupService {
  /**
   * Backs up all files directly inside the given OneDrive folder for the
   * authenticated user (identified via their session/access token).
   *
   * Returns { backupId, filesBackedUp, status }.
   */
  async startBackup(session, folderId) {
    const accessToken = session.accessToken;
    const userId = (session.account && (session.account.id || session.account.userPrincipalName)) || 'unknown';

    // A correlation id is created up front so steps can be logged before the
    // Firestore-generated backupId exists. The Firestore id is recorded as a
    // step once known, and the final log entry exposes both.
    const jobId = crypto.randomBytes(12).toString('hex');
    safeLog(() => jobLogger.startJob(jobId, 'backup', { userId, folderId }));

    try {
      const files = await GraphService.listFilesInFolder(accessToken, folderId);
      safeLog(() => jobLogger.logStep(jobId, 'listFilesInFolder', { count: files.length, files }));

      const uploadedFiles = [];
      for (const file of files) {
        const buffer = await GraphService.downloadFile(accessToken, file.id);
        safeLog(() => jobLogger.logStep(jobId, 'downloadFile', { fileId: file.id, name: file.name, bytes: buffer.length }));

        const destinationPath = `${userId}/${folderId}/${file.id}-${file.name}`;
        const uploadedPath = await StorageService.uploadFile(buffer, destinationPath);
        safeLog(() => jobLogger.logStep(jobId, 'uploadFile', { fileId: file.id, destinationPath: uploadedPath }));

        uploadedFiles.push({
          fileId: file.id,
          name: file.name,
          gcsPath: destinationPath,
        });
      }

      const backupId = await FirestoreService.createBackupRecord({
        userId,
        folderId,
        status: 'completed',
        filesBackedUp: uploadedFiles.length,
        files: uploadedFiles,
      });
      safeLog(() => jobLogger.logStep(jobId, 'createBackupRecord', { backupId }));

      const result = {
        backupId,
        filesBackedUp: uploadedFiles.length,
        status: 'completed',
      };

      safeLog(() => jobLogger.finishJob(jobId, 'completed', { ...result, jobId }));

      return result;
    } catch (err) {
      safeLog(() => jobLogger.logStep(jobId, 'error', { message: err.message }));
      safeLog(() => jobLogger.finishJob(jobId, 'failed', { jobId, error: err.message }));
      throw err;
    }
  }

  async restoreBackup(backupId) {
    throw new Error('Not implemented');
  }
}

module.exports = new BackupService();
