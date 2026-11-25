import type { z } from 'zod';
import type { ParseResult } from '../../../common/validation/parse-body.js';
import type { loginSchema } from './login.schema.js';

/** Validated, normalised body of POST /api/auth/login. */
export type LoginInput = z.infer<typeof loginSchema>;

export type ParseLoginResult = ParseResult<LoginInput>;

/** Request details login needs besides the credentials. */
export interface LoginContext {
  /** Client IP, half of the rate-limit key. */
  ip: string;
  /** Refresh token the client already holds, if any; replaced by the new one. */
  currentRefreshToken?: string;
}
