import { z } from 'zod';
import { parseBody } from '../../../common/validation/parse-body.js';
import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '../shared/auth.constants.js';
import { LOGIN_MESSAGES as MSG } from './login.constants.js';
import type { ParseLoginResult } from './login.types.js';

/**
 * Only checks shape: the password's minimum length is a sign-up rule, not a login one — any
 * wrong password, short or not, gets the same 401.
 */
export const loginSchema = z.object({
  email: z
    .string({ error: MSG.emailInvalid })
    .trim()
    .toLowerCase()
    .max(EMAIL_MAX_LENGTH, MSG.emailInvalid)
    .pipe(z.email(MSG.emailInvalid)),
  password: z
    .string({ error: MSG.passwordRequired })
    .min(1, MSG.passwordRequired)
    .max(PASSWORD_MAX_LENGTH, MSG.passwordTooLong),
});

export function parseLogin(body: unknown): ParseLoginResult {
  return parseBody(loginSchema, body);
}
