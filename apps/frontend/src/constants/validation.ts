// Mirrors apps/backend/src/auth/auth.constants.ts — keep limits and messages in sync.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^\+?\d{9,15}$/;
/** Spaces and dashes users type in phone numbers; stripped before validating. */
export const PHONE_SEPARATORS_RE = /[\s-]/g;

export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const VALIDATION_MESSAGES = {
  nameRequired: 'Please enter your name',
  nameTooLong: `Name must be ${NAME_MAX_LENGTH} characters or fewer`,
  emailInvalid: 'Please enter a valid email address',
  phoneInvalid: 'Please enter a valid phone number (9–15 digits)',
  passwordTooShort: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  passwordTooLong: `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`,
} as const;
