import type { PublicUser } from '@flower-shop/shared';
import type { AuthFormResult, FormErrors } from '../shared/auth.types';

export interface LoginValues {
  email: string;
  password: string;
}

export type LoginErrors = FormErrors<LoginValues>;

/** Form-level login failures, shown above the fields. */
export type LoginFailure = 'invalid_credentials' | 'rate_limited' | 'error';

export type LoginResult = AuthFormResult<LoginValues, LoginFailure>;

export interface LoginFormProps {
  /** Prefix for input ids, so the header panel and the /login page can be on screen together. */
  idPrefix: string;
  /** Called after a successful login, once the user is in auth state. */
  onSuccess?: (user: PublicUser) => void;
}
