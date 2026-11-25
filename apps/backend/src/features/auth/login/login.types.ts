import type { z } from 'zod';
import type { loginSchema } from './login.schema.js';

/** Validated, normalised body of POST /api/auth/login. */
export type LoginInput = z.infer<typeof loginSchema>;

/** Request details login needs besides the credentials. */
export interface LoginContext {
  /** Client IP, half of the rate-limit key. */
  ip: string;
  /** Session token from the access cookie the client already holds, if any; that session is revoked. */
  currentSessionToken?: string;
}
