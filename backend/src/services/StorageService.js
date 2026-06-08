// Wraps Google Cloud Storage operations (uploading backed-up files,
// generating download URLs for restore). Logic to be implemented.

class StorageService {
  async uploadFile(objectPath, fileStream, metadata) {
    throw new Error('Not implemented');
  }

  async getDownloadUrl(objectPath) {
    throw new Error('Not implemented');
  }
}

module.exports = new StorageService();
