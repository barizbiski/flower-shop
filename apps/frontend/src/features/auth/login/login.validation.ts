import { EMAIL_MAX_LENGTH, EMAIL_RE, LOGIN_MESSAGES as MSG, PASSWORD_MAX_LENGTH } from '@flower-shop/shared';
import type { LoginErrors, LoginValues } from './login.types';

// Same rules as apps/backend/src/features/auth/login/login.schema.ts; limits and messages come from @flower-shop/shared.
// No minimum password length: any wrong password gets the same "Incorrect email or password".
export function validateLogin(v: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
  const email = v.email.trim();
  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX_LENGTH) errors.email = MSG.emailInvalid;

  if (!v.password) errors.password = MSG.passwordRequired;
  else if (v.password.length > PASSWORD_MAX_LENGTH) errors.password = MSG.passwordTooLong;

  return errors;
}
