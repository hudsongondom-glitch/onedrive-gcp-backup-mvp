const axios = require('axios');
const msConfig = require('../config/microsoftGraph');

// Wraps calls to the Microsoft Graph API (listing OneDrive folders/files,
// downloading file content). Logic to be implemented.

class GraphService {
  /**
   * GET https://graph.microsoft.com/v1.0/me
   * Returns the signed-in user's profile.
   */
  async getMe(accessToken) {
    const response = await axios.get(`${msConfig.graphBaseUrl}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

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
