import type { ErrorRequestHandler } from 'express';

export type FieldErrors = Record<string, string>;

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: FieldErrors,
  ) {
    super(message);
  }
}

/** Uniform error envelope: { error: { code, message, fields? } }. Never echoes request bodies. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.fields && { fields: err.fields }) },
    });
    return;
  }
  // body-parser errors (malformed JSON, payload too large) carry a status and type.
  if (typeof err?.status === 'number' && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({ error: { code: 'BAD_REQUEST', message: 'Invalid request body' } });
    return;
  }
  console.error('Unhandled error:', err instanceof Error ? err.message : 'unknown');
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong' } });
};
