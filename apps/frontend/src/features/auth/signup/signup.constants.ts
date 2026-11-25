import type { SignupFailure, SignupValues } from './signup.types';

export const EMPTY_SIGNUP_VALUES: SignupValues = { name: '', email: '', phone: '', password: '' };

/** Form-level failure for each POST /api/auth/register status; any other status is `error`. */
export const REGISTER_FAILURE_BY_STATUS: Partial<Record<number, SignupFailure>> = {
  409: 'email_taken',
};
