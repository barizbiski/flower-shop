import type { User } from '../shared/auth.types';

export interface LoginValues {
  email: string;
  password: string;
}

export type LoginField = keyof LoginValues;
export type LoginErrors = Partial<Record<LoginField, string>>;

/** Form-level failure shown above the fields. */
export type LoginFormError = 'invalid_credentials' | 'rate_limited' | 'error' | null;

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; kind: 'invalid_credentials' }
  | { ok: false; kind: 'rate_limited' }
  | { ok: false; kind: 'invalid'; fields: LoginErrors }
  | { ok: false; kind: 'error' };

export interface UseLoginFormOptions {
  /** Called after a successful login, once the user is in auth state. */
  onSuccess?: (user: User) => void;
}

export interface LoginFormProps extends UseLoginFormOptions {
  /** Prefix for input ids, so the header panel and the /login page can be on screen together. */
  idPrefix: string;
}
