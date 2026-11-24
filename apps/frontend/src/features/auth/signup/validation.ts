import {
  EMAIL_MAX_LENGTH,
  EMAIL_RE,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_RE,
  PHONE_SEPARATORS_RE,
  VALIDATION_MESSAGES as MSG,
} from '../../../constants/validation';
import type { SignupErrors, SignupValues } from '../types';

// Mirrors apps/backend/src/auth/register.schema.ts — keep rules in sync.
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
