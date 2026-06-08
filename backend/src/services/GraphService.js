// Wraps calls to the Microsoft Graph API (listing OneDrive folders/files,
// downloading file content). Logic to be implemented.

class GraphService {
  async listFolders(accessToken, parentId) {
    throw new Error('Not implemented');
  }

  async listFiles(accessToken, folderId) {
    throw new Error('Not implemented');
  }

  async downloadFile(accessToken, fileId) {
    throw new Error('Not implemented');
  }
}

module.exports = new GraphService();
