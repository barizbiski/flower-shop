/** Session cookie name; the cookie holds the raw token, the DB only its SHA-256 hash. */
export const SESSION_COOKIE = 'sid';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const SESSION_TOKEN_BYTES = 32;

/** Postgres error code for a unique-constraint violation. */
export const PG_UNIQUE_VIOLATION = '23505';

// Credential limits shared by register and login.
// Keep in sync with apps/frontend/src/constants/validation.ts.
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
