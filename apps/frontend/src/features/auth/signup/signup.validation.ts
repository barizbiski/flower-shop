import {
  EMAIL_MAX_LENGTH,
  EMAIL_RE,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_RE,
  PHONE_SEPARATORS_RE,
  REGISTER_MESSAGES as MSG,
} from '@flower-shop/shared';
import type { SignupErrors, SignupValues } from './signup.types';

// Same rules as apps/backend/src/features/auth/register/register.schema.ts; limits and messages come from @flower-shop/shared.
export function validateSignup(v: SignupValues): SignupErrors {
  const errors: SignupErrors = {};
  const name = v.name.trim();
  if (!name) errors.name = MSG.nameRequired;
  else if (name.length > NAME_MAX_LENGTH) errors.name = MSG.nameTooLong;

  const email = v.email.trim();
  if (!EMAIL_RE.test(email) || email.length > EMAIL_MAX_LENGTH) errors.email = MSG.emailInvalid;

  if (!PHONE_RE.test(v.phone.replace(PHONE_SEPARATORS_RE, ''))) errors.phone = MSG.phoneInvalid;

  if (v.password.length < PASSWORD_MIN_LENGTH) errors.password = MSG.passwordTooShort;
  else if (v.password.length > PASSWORD_MAX_LENGTH) errors.password = MSG.passwordTooLong;

  return errors;
}
