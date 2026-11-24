import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../shared/auth.constants.js';

// Keep limits and messages in sync with apps/frontend/src/constants/validation.ts.
export const NAME_MAX_LENGTH = 100;
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
