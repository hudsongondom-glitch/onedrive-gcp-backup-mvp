const { Firestore } = require('@google-cloud/firestore');

// On Cloud Run, credentials come from the attached service account.
// Locally, GOOGLE_APPLICATION_CREDENTIALS should point to a key file.
const firestore = new Firestore({
  projectId: process.env.FIRESTORE_PROJECT_ID || process.env.GCP_PROJECT_ID || undefined,
});

const collections = {
  users: 'users',
  backups: 'backups',
  backupHistory: 'backupHistory',
};

module.exports = { firestore, collections };
