import { API_BASE_PATH, AUTH_BASE_PATH } from '@flower-shop/shared';

/** Refresh-session lifetime (the `sessions` row's fixed expiry). */
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Random bytes of a session token; its SHA-256 is the `sessions` row id, the raw token is the JWT `sub`. */
export const REFRESH_TOKEN_BYTES = 32;

/** Access-token (JWT) lifetime, in seconds. */
export const ACCESS_TOKEN_TTL_S = 15 * 60;
export const ACCESS_TOKEN_ALGORITHM = 'HS256';

/** httpOnly cookie that holds the access token (JWT); sent to the whole API. */
export const ACCESS_COOKIE = 'access_token';
export const ACCESS_COOKIE_PATH = API_BASE_PATH;
/**
 * The cookie outlives the JWT inside it: it is kept for the session's 30 days so the browser can
 * still send an expired JWT to /refresh. The 15-minute limit is enforced by the JWT's `exp`.
 */
export const ACCESS_COOKIE_MAX_AGE_MS = REFRESH_TTL_MS;

/** Cookie of the previous design (raw refresh token on /api/auth); only cleared now, never read. */
export const LEGACY_REFRESH_COOKIE = 'refresh_token';
export const LEGACY_REFRESH_COOKIE_PATH = AUTH_BASE_PATH;

/** Postgres error code for a unique-constraint violation. */
export const PG_UNIQUE_VIOLATION = '23505';

// Credential limits and form messages live in @flower-shop/shared (used by the web app too).

/** Messages shared by every auth route. */
export const AUTH_MESSAGES = {
  unauthenticated: 'Please log in to continue',
} as const;
