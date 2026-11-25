import { AUTH_BASE_PATH } from '@flower-shop/shared';

/** Refresh-token cookie name; the cookie holds the raw token, the `sessions` table only its SHA-256 hash. */
export const REFRESH_COOKIE = 'refresh_token';
/** The cookie is only sent to the auth routes (login, refresh, logout), never to the rest of the API. */
export const REFRESH_COOKIE_PATH = AUTH_BASE_PATH;
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const REFRESH_TOKEN_BYTES = 32;
/** Body field a non-browser client (future mobile app) may send its refresh token in. */
export const REFRESH_TOKEN_BODY_FIELD = 'refreshToken';

/** Access-token (JWT) lifetime, in seconds. */
export const ACCESS_TOKEN_TTL_S = 15 * 60;
export const ACCESS_TOKEN_ALGORITHM = 'HS256';

/** Postgres error code for a unique-constraint violation. */
export const PG_UNIQUE_VIOLATION = '23505';

// Credential limits and form messages live in @flower-shop/shared (used by the web app too).

/** Messages shared by every auth route. */
export const AUTH_MESSAGES = {
  unauthenticated: 'Please log in to continue',
} as const;
