// Minimal fetch-based API client. Keeps the MVP free of extra HTTP libraries.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const SESSION_KEY = 'sessionId';

export function getSessionId() {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionId(sessionId) {
  localStorage.setItem(SESSION_KEY, sessionId);
}

export function clearSessionId() {
  localStorage.removeItem(SESSION_KEY);
}

async function request(path, options = {}) {
  const sessionId = getSessionId();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId ? { 'x-session-id': sessionId } : {}),
      ...(options.headers || {}),
    },
  });

  let body = null;
  try {
    body = await response.json();
  } catch (_err) {
    // no JSON body — leave as null
  }

  if (!response.ok) {
    const message = (body && (body.error || body.message)) || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body;
}

export const api = {
  loginUrl: () => `${API_BASE_URL}/auth/microsoft/login`,
  getFolders: () => request('/onedrive/folders'),
  startBackup: (folderId) =>
    request('/backup/start', { method: 'POST', body: JSON.stringify({ folderId }) }),
  getHistory: () => request('/backup/history'),
  getRestore: (backupId) => request(`/restore/${encodeURIComponent(backupId)}`),
};
