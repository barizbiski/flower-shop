import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_RE,
  PHONE_SEPARATORS_RE,
  REGISTER_MESSAGES as MSG,
} from '@flower-shop/shared';
import { z } from 'zod';

// The web form checks the same limits and messages (from @flower-shop/shared) before submitting.
const requiredString = (message: string) => z.string({ error: message });

export const registerSchema = z.object({
  name: requiredString(MSG.nameRequired).trim().min(1, MSG.nameRequired).max(NAME_MAX_LENGTH, MSG.nameTooLong),
  email: requiredString(MSG.emailInvalid)
    .trim()
    .toLowerCase()
    .max(EMAIL_MAX_LENGTH, MSG.emailInvalid)
    .pipe(z.email(MSG.emailInvalid)),
  phone: requiredString(MSG.phoneInvalid)
    .transform((s) => s.replace(PHONE_SEPARATORS_RE, ''))
    .pipe(z.string().regex(PHONE_RE, MSG.phoneInvalid)),
  password: requiredString(MSG.passwordTooShort)
    .min(PASSWORD_MIN_LENGTH, MSG.passwordTooShort)
    .max(PASSWORD_MAX_LENGTH, MSG.passwordTooLong),
});
