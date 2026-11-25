/**
 * Client-side session state. The access token lives in memory only — never persisted — so a
 * reload gets a new one from /refresh.
 */
let accessToken: string | null = null;
/** Called when a refresh fails with 401, so auth state can switch to logged out. */
let sessionExpiredHandler: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

export function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}
