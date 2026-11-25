import { API_MESSAGES, ERROR_CODES, type FieldErrors } from '@flower-shop/shared';
import type { z } from 'zod';
import { HttpError } from '../http/errors.js';

/**
 * Validates a request body with a zod schema and returns the parsed data. On failure throws a
 * 400 VALIDATION_ERROR whose `fields` hold the first message per top-level field.
 */
export function parseBodyOrThrow<S extends z.ZodType>(schema: S, body: unknown): z.output<S> {
  const result = schema.safeParse(body ?? {});
  if (result.success) return result.data;

  const fields: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'body');
    fields[key] ??= issue.message;
  }
  throw new HttpError(400, ERROR_CODES.VALIDATION_ERROR, API_MESSAGES.formInvalid, fields);
}
