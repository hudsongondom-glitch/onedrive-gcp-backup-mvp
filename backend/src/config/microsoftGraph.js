// Configuration for Microsoft Graph API / OAuth 2.0 Authorization Code Flow.

const microsoftGraphConfig = {
  clientId: process.env.MICROSOFT_CLIENT_ID || '',
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
  tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
  redirectUri: process.env.MICROSOFT_REDIRECT_URI || '',
  graphBaseUrl: process.env.MS_GRAPH_BASE_URL || 'https://graph.microsoft.com/v1.0',
  scopes: (process.env.MS_OAUTH_SCOPES || 'offline_access User.Read Files.Read Files.Read.All').split(' '),

  get authorityUrl() {
    return `https://login.microsoftonline.com/${this.tenantId}`;
  },
  get authorizeEndpoint() {
    return `${this.authorityUrl}/oauth2/v2.0/authorize`;
  },
  get tokenEndpoint() {
    return `${this.authorityUrl}/oauth2/v2.0/token`;
  },
};

module.exports = microsoftGraphConfig;
