const GraphService = require('./GraphService');
const StorageService = require('./StorageService');
const FirestoreService = require('./FirestoreService');

// Orchestrates a backup run: pulls files via GraphService, uploads them via
// StorageService, and records metadata via FirestoreService.

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

    const files = await GraphService.listFilesInFolder(accessToken, folderId);

    const uploadedFiles = [];
    for (const file of files) {
      const buffer = await GraphService.downloadFile(accessToken, file.id);
      const destinationPath = `${userId}/${folderId}/${file.id}-${file.name}`;
      await StorageService.uploadFile(buffer, destinationPath);
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

    return {
      backupId,
      filesBackedUp: uploadedFiles.length,
      status: 'completed',
    };
  }

  async restoreBackup(backupId) {
    throw new Error('Not implemented');
  }
}

module.exports = new BackupService();
