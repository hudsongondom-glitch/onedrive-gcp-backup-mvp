const { firestore, collections } = require('../config/firestore');

// Wraps Firestore reads/writes for user records, backup configs, and
// backup history entries.

class FirestoreService {
  /**
   * Creates a backup metadata record and returns its generated id.
   */
  async createBackupRecord(metadata) {
    const docRef = await firestore.collection(collections.backups).add({
      ...metadata,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  }

  async saveBackupRecord(record) {
    throw new Error('Not implemented');
  }

  async getBackupHistory(userId) {
    throw new Error('Not implemented');
  }

  async getBackupById(backupId) {
    throw new Error('Not implemented');
  }
}

module.exports = new FirestoreService();
