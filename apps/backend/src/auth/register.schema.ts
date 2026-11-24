import { z } from 'zod';
import type { FieldErrors } from '../common/types/field-errors.js';
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_RE,
  PHONE_SEPARATORS_RE,
  REGISTER_MESSAGES as MSG,
} from './auth.constants.js';
import type { ParseRegisterResult } from './auth.types.js';

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
  const result = registerSchema.safeParse(body ?? {});
  if (result.success) return { ok: true, data: result.data };

  const fields: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'body');
    fields[key] ??= issue.message;
  }
  return { ok: false, fields };
}
