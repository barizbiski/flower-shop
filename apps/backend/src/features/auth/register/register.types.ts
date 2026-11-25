import type { z } from 'zod';
import type { FieldErrors } from '../../../common/types/field-errors.js';
import type { PublicUser } from '../shared/auth.types.js';
import type { registerSchema } from './register.schema.js';

/** Validated, normalised body of POST /api/auth/register. */
export type RegisterInput = z.infer<typeof registerSchema>;

export type ParseRegisterResult = { ok: true; data: RegisterInput } | { ok: false; fields: FieldErrors };

export interface RegisterResult {
  user: PublicUser;
  /** Raw session token, for the cookie only. */
  token: string;
}
