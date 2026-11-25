import {
  EMAIL_MAX_LENGTH,
  EMAIL_RE,
  PASSWORD_MAX_LENGTH,
  VALIDATION_MESSAGES as MSG,
} from '../../../constants/validation';
import type { LoginErrors, LoginValues } from './login.types';

// Mirrors apps/backend/src/features/auth/login/login.schema.ts — keep rules in sync.
// No minimum password length: any wrong password gets the same "Incorrect email or password".
export function validateLogin(v: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
  const email = v.email.trim();
  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX_LENGTH) errors.email = MSG.emailInvalid;

  if (!v.password) errors.password = MSG.passwordRequired;
  else if (v.password.length > PASSWORD_MAX_LENGTH) errors.password = MSG.passwordTooLong;

  return errors;
}
