import type { z } from 'zod';
import type { FieldErrors } from '../types/field-errors.js';

export type ParseResult<T> = { ok: true; data: T } | { ok: false; fields: FieldErrors };

/**
 * Validates a request body with a zod schema. On failure returns the first message per
 * top-level field, ready for the `fields` of a 400 VALIDATION_ERROR.
 */
export function parseBody<S extends z.ZodType>(schema: S, body: unknown): ParseResult<z.output<S>> {
  const result = schema.safeParse(body ?? {});
  if (result.success) return { ok: true, data: result.data };

  const fields: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'body');
    fields[key] ??= issue.message;
  }
  return { ok: false, fields };
}
