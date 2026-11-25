import { LOGIN_MESSAGES } from '@flower-shop/shared';
import { FORM_ERROR_MESSAGE } from '../shared/auth.constants';
import type { LoginFailure, LoginValues } from './login.types';

export const EMPTY_LOGIN_VALUES: LoginValues = { email: '', password: '' };

/** Form-level failure for each POST /api/auth/login status; any other status is `error`. */
export const LOGIN_FAILURE_BY_STATUS: Partial<Record<number, LoginFailure>> = {
  401: 'invalid_credentials',
  429: 'rate_limited',
};

/** Banner text for each form-level login failure. */
export const LOGIN_FORM_MESSAGES: Record<LoginFailure, string> = {
  invalid_credentials: LOGIN_MESSAGES.invalidCredentials,
  rate_limited: LOGIN_MESSAGES.rateLimited,
  error: FORM_ERROR_MESSAGE,
};
