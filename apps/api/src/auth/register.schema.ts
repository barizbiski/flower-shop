import { z } from 'zod';
import type { FieldErrors } from '../http/errors.js';

// Keep rules and messages in sync with apps/web/src/features/auth/signup/validation.ts.
const requiredString = (message: string) => z.string({ error: message });

export const registerSchema = z.object({
  name: requiredString('Please enter your name')
    .trim()
    .min(1, 'Please enter your name')
    .max(100, 'Name must be 100 characters or fewer'),
  email: requiredString('Please enter a valid email address')
    .trim()
    .toLowerCase()
    .max(254, 'Please enter a valid email address')
    .pipe(z.email('Please enter a valid email address')),
  phone: requiredString('Please enter a valid phone number (9–15 digits)')
    .transform((s) => s.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^\+?\d{9,15}$/, 'Please enter a valid phone number (9–15 digits)')),
  password: requiredString('Password must be at least 8 characters')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or fewer'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export function parseRegister(body: unknown): { ok: true; data: RegisterInput } | { ok: false; fields: FieldErrors } {
  const result = registerSchema.safeParse(body ?? {});
  if (result.success) return { ok: true, data: result.data };

  const fields: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'body');
    fields[key] ??= issue.message;
  }
  return { ok: false, fields };
}
