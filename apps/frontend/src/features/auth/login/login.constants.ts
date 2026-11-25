import type { LoginFormError, LoginValues } from './login.types';

export const EMPTY_LOGIN_VALUES: LoginValues = { email: '', password: '' };

/** Mirrors apps/backend/src/features/auth/login/login.constants.ts LOGIN_MESSAGES — keep in sync. */
export const LOGIN_FORM_MESSAGES: Record<Exclude<LoginFormError, null>, string> = {
  invalid_credentials: 'Incorrect email or password',
  rate_limited: 'Too many attempts. Please try again later.',
  error: 'Something went wrong. Please try again.',
};
