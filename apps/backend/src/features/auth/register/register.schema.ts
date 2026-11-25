import { z } from 'zod';
import { parseBody } from '../../../common/validation/parse-body.js';
import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../shared/auth.constants.js';
import { NAME_MAX_LENGTH, PHONE_RE, PHONE_SEPARATORS_RE, REGISTER_MESSAGES as MSG } from './register.constants.js';
import type { ParseRegisterResult } from './register.types.js';

// Keep rules in sync with apps/frontend/src/features/auth/signup/validation.ts.
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

export function parseRegister(body: unknown): ParseRegisterResult {
  return parseBody(registerSchema, body);
}
