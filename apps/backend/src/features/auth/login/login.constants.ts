import { PASSWORD_MAX_LENGTH } from '../shared/auth.constants.js';

// Keep messages in sync with apps/frontend/src/features/auth/login/.
export const LOGIN_MESSAGES = {
  emailInvalid: 'Please enter a valid email address',
  passwordRequired: 'Please enter your password',
  passwordTooLong: `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`,
  formInvalid: 'Please fix the highlighted fields',
  /** Same message for a wrong password and an unknown email, so it doesn't reveal which. */
  invalidCredentials: 'Incorrect email or password',
  rateLimited: 'Too many attempts. Please try again later.',
} as const;

/** Failed logins allowed per IP + email within one window; the next attempt gets 429. */
export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
/** Prune expired rate-limit entries once the map holds this many keys. */
export const LOGIN_LIMITER_SWEEP_AT = 10_000;

/**
 * argon2id hash of a random, discarded password. Login verifies against it when the email is
 * unknown, so a missing account takes as long as a wrong password and timing reveals nothing.
 */
export const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$utF39+62mRbnUQ43KTmn+Q$CHd5AcaEFmbeFRtlQQJfDDbJenFbf/ujC5+xFcxRhFo';
