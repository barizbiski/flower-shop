// Public API of the HTTP client. `send` stays internal: callers go through getJson/postJson.
export { isApiError, isAuthResponse } from './guards';
export { refreshAccessToken } from './refresh';
export { getJson, postJson } from './request';
export { setSessionExpiredHandler } from './session';
