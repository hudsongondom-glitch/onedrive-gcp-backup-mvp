const crypto = require('crypto');
const axios = require('axios');
const qs = require('querystring');

const msConfig = require('../config/microsoftGraph');

// MVP-only in-memory storage. Lost on restart; not shared across instances.
// sessionId -> { accessToken, refreshToken, expiresAt, account }
const sessions = new Map();

// state -> createdAt (basic CSRF protection for the OAuth redirect)
const pendingStates = new Map();

class AuthService {
  /**
   * Builds the Microsoft Identity Platform authorization URL the user is redirected to.
   */
  getLoginUrl() {
    const state = crypto.randomBytes(16).toString('hex');
    pendingStates.set(state, Date.now());

    const params = {
      client_id: msConfig.clientId,
      response_type: 'code',
      redirect_uri: msConfig.redirectUri,
      response_mode: 'query',
      scope: msConfig.scopes.join(' '),
      state,
    };

    return `${msConfig.authorizeEndpoint}?${qs.stringify(params)}`;
  }

  isValidState(state) {
    if (!state || !pendingStates.has(state)) return false;
    pendingStates.delete(state);
    return true;
  }




  /**
   * Exchanges an authorization code for tokens, fetches the user's profile,
   * and stores the session in memory. Returns { sessionId, profile }.
   */
  async handleCallback(code) {

      // Debugging: log the critical Microsoft Graph config values on startup.
console.log('CLIENT_ID:', msConfig.clientId);
console.log('CLIENT_SECRET_EXISTS:', !!msConfig.clientSecret);
console.log('TENANT_ID:', msConfig.tenantId);
console.log('REDIRECT_URI:', msConfig.redirectUri);
console.log('TOKEN_ENDPOINT:', msConfig.tokenEndpoint);

    const tokenResponse = await axios.post(
      msConfig.tokenEndpoint,
      qs.stringify({
        client_id: msConfig.clientId,
        client_secret: msConfig.clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: msConfig.redirectUri,
        scope: msConfig.scopes.join(' '),
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token: accessToken, refresh_token: refreshToken, expires_in: expiresIn } = tokenResponse.data;

    const GraphService = require('./GraphService');
    const profile = await GraphService.getMe(accessToken);

    const sessionId = crypto.randomBytes(24).toString('hex');
    sessions.set(sessionId, {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
      account: profile,
    });

    return { sessionId, profile };
  }

  getSession(sessionId) {
    return sessions.get(sessionId) || null;
  }
}

module.exports = new AuthService();
