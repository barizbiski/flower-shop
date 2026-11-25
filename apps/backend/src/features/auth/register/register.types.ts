import type { z } from 'zod';
import type { registerSchema } from './register.schema.js';

/** Validated, normalised body of POST /api/auth/register. */
export type RegisterInput = z.infer<typeof registerSchema>;
