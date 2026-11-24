import type { z } from 'zod';
import type { FieldErrors } from '../common/types/field-errors.js';
import type { registerSchema } from './register.schema.js';

/** User fields safe to return to the client (no password hash). */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/** Row data for inserting a user. */
export interface NewUser {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
}

/** Validated, normalised body of POST /api/auth/register. */
export type RegisterInput = z.infer<typeof registerSchema>;

export type ParseRegisterResult = { ok: true; data: RegisterInput } | { ok: false; fields: FieldErrors };

export interface RegisterResult {
  user: PublicUser;
  /** Raw session token, for the cookie only. */
  token: string;
}
