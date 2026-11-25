// LOGIN_MESSAGES live in @flower-shop/shared (the login form shows them too).

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
