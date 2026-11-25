import type { z } from 'zod';
import type { ParseResult } from '../../../common/validation/parse-body.js';
import type { registerSchema } from './register.schema.js';

/** Validated, normalised body of POST /api/auth/register. */
export type RegisterInput = z.infer<typeof registerSchema>;

export type ParseRegisterResult = ParseResult<RegisterInput>;
