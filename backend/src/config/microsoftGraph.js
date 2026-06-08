// Configuration for Microsoft Graph API / OAuth 2.0 Authorization Code Flow.
// No OAuth logic lives here yet — values are read by AuthService / GraphService later.

const microsoftGraphConfig = {
  clientId: process.env.MS_CLIENT_ID || '',
  clientSecret: process.env.MS_CLIENT_SECRET || '',
  tenantId: process.env.MS_TENANT_ID || 'common',
  redirectUri: process.env.MS_REDIRECT_URI || '',
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
