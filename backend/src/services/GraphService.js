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

  /**
   * GET /me/drive/root/children
   * Returns the items at the root of the user's OneDrive.
   */
  async getRootFolders(accessToken) {
    const response = await axios.get(`${msConfig.graphBaseUrl}/me/drive/root/children`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return this._mapItems(response.data.value);
  }

  /**
   * GET /me/drive/items/{folderId}/children
   * Returns the items inside the given folder.
   */
  async getFolderChildren(accessToken, folderId) {
    const response = await axios.get(`${msConfig.graphBaseUrl}/me/drive/items/${folderId}/children`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return this._mapItems(response.data.value);
  }

  // Trims Graph drive items down to the fields useful for folder selection.
  _mapItems(items) {
    return (items || []).map((item) => ({
      id: item.id,
      name: item.name,
      folder: item.folder,
      file: item.file,
      webUrl: item.webUrl,
    }));
  }

  /**
   * Lists the files (non-folder items) directly inside a OneDrive folder.
   */
  async listFilesInFolder(accessToken, folderId) {
    const response = await axios.get(`${msConfig.graphBaseUrl}/me/drive/items/${folderId}/children`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return this._mapItems(response.data.value).filter((item) => !!item.file);
  }

  /**
   * Downloads a file's binary content as a Buffer.
   * GET /me/drive/items/{fileId}/content
   */
  async downloadFile(accessToken, fileId) {
    const response = await axios.get(`${msConfig.graphBaseUrl}/me/drive/items/${fileId}/content`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  }

  async listFolders(accessToken, parentId) {
    throw new Error('Not implemented');
  }

  async listFiles(accessToken, folderId) {
    throw new Error('Not implemented');
  }
}

module.exports = new GraphService();
