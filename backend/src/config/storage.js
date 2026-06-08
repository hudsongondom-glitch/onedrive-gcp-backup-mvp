const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID || undefined,
});

const bucketName = process.env.GCS_BUCKET_NAME || 'onedrive-backup-mvp-storage-hudsong';
const bucket = storage.bucket(bucketName);

module.exports = { storage, bucket, bucketName };
