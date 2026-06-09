const { bucket } = require('../config/storage');

// Wraps Google Cloud Storage operations (uploading backed-up files,
// generating download URLs for restore).

class StorageService {
  /**
   * Uploads a file buffer to the configured GCS bucket at the given path.
   * Returns the GCS object path.
   */
  async uploadFile(buffer, destinationPath) {
    const file = bucket.file(destinationPath);
    await file.save(buffer);
    return destinationPath;
  }

  /**
   * Returns a readable stream for the given GCS object path.
   * The caller is responsible for piping it to the HTTP response.
   */
  createReadStream(objectPath) {
    return bucket.file(objectPath).createReadStream();
  }
}

module.exports = new StorageService();
