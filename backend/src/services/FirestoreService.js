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

  /**
   * Returns backup records, most recent first. If userId is provided,
   * results are scoped to that user; otherwise all backups are returned
   * (kept simple for MVP — single-tenant usage expected).
   */
  async getBackupHistory(userId) {
    let query = firestore.collection(collections.backups);
    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.get();

    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          backupId: doc.id,
          folderId: data.folderId,
          fileCount: data.filesBackedUp,
          createdAt: data.createdAt,
        };
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  /**
   * Looks up a single backup record by its Firestore document id.
   * Returns null if it doesn't exist.
   */
  async getBackupById(backupId) {
    const doc = await firestore.collection(collections.backups).doc(backupId).get();
    if (!doc.exists) return null;

    return { backupId: doc.id, ...doc.data() };
  }
}

module.exports = new FirestoreService();
