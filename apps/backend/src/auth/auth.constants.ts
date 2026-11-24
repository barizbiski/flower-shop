/** Session cookie name; the cookie holds the raw token, the DB only its SHA-256 hash. */
export const SESSION_COOKIE = 'sid';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const SESSION_TOKEN_BYTES = 32;

/** Postgres error code for a unique-constraint violation. */
export const PG_UNIQUE_VIOLATION = '23505';

// Keep limits and messages in sync with apps/frontend/src/constants/validation.ts.
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const PHONE_RE = /^\+?\d{9,15}$/;
/** Spaces and dashes users type in phone numbers; stripped before validating. */
export const PHONE_SEPARATORS_RE = /[\s-]/g;

export const REGISTER_MESSAGES = {
  nameRequired: 'Please enter your name',
  nameTooLong: `Name must be ${NAME_MAX_LENGTH} characters or fewer`,
  emailInvalid: 'Please enter a valid email address',
  phoneInvalid: 'Please enter a valid phone number (9–15 digits)',
  passwordTooShort: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  passwordTooLong: `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`,
  formInvalid: 'Please fix the highlighted fields',
  emailTaken: 'An account with this email already exists',
} as const;
