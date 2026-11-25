/**
 * Client-side session state. The access token lives only in an httpOnly cookie that the browser
 * sends by itself — this code never sees it. All that is kept here is who to tell when the session
 * can't be refreshed any more.
 */
let sessionExpiredHandler: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

export function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}
