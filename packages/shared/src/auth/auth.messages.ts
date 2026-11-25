import { NAME_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from './auth.constants.js';

/** Field messages used by both register and login. */
const CREDENTIAL_MESSAGES = {
  emailInvalid: 'Please enter a valid email address',
  passwordTooLong: `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`,
} as const;

/** Messages of POST /api/auth/register, also shown by the sign-up form. */
export const REGISTER_MESSAGES = {
  ...CREDENTIAL_MESSAGES,
  nameRequired: 'Please enter your name',
  nameTooLong: `Name must be ${NAME_MAX_LENGTH} characters or fewer`,
  phoneInvalid: 'Please enter a valid phone number (9–15 digits)',
  passwordTooShort: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  emailTaken: 'An account with this email already exists',
} as const;

/** Messages of POST /api/auth/login, also shown by the login form. */
export const LOGIN_MESSAGES = {
  ...CREDENTIAL_MESSAGES,
  passwordRequired: 'Please enter your password',
  /** Same message for a wrong password and an unknown email, so it doesn't reveal which. */
  invalidCredentials: 'Incorrect email or password',
  rateLimited: 'Too many attempts. Please try again later.',
} as const;
