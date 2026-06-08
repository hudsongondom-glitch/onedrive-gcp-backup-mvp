// Orchestrates a backup run: pulls files via GraphService, uploads them via
// StorageService, and records metadata via FirestoreService. Logic to be implemented.

class BackupService {
  async startBackup(userId, folderId) {
    throw new Error('Not implemented');
  }

  async restoreBackup(backupId) {
    throw new Error('Not implemented');
  }
}

module.exports = new BackupService();
