// Wraps Firestore reads/writes for user records, backup configs, and
// backup history entries. Logic to be implemented.

class FirestoreService {
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
