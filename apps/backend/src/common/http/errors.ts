import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { ERROR_CODES, type ErrorCode, type FieldErrors } from '@flower-shop/shared';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly fields?: FieldErrors,
  ) {
    super(message);
  }
}

/** Uniform error envelope: { error: { code, message, fields? } }. Never echoes request bodies. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(err: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    if (err instanceof HttpError) {
      res.status(err.status).json({
        error: { code: err.code, message: err.message, ...(err.fields && { fields: err.fields }) },
      });
      return;
    }
    // Nest's own exceptions: unknown route (404) or body-parser failures (malformed JSON, payload too large).
    const status =
      err instanceof HttpException
        ? err.getStatus()
        : typeof (err as { status?: unknown })?.status === 'number'
          ? (err as { status: number }).status
          : 500;
    if (status === 404) {
      res.status(404).json({ error: { code: ERROR_CODES.NOT_FOUND, message: 'Not found' } });
      return;
    }
    if (status >= 400 && status < 500) {
      res.status(status).json({ error: { code: ERROR_CODES.BAD_REQUEST, message: 'Invalid request body' } });
      return;
    }
    console.error('Unhandled error:', err instanceof Error ? err.message : 'unknown');
    res.status(500).json({ error: { code: ERROR_CODES.INTERNAL, message: 'Something went wrong' } });
  }
}
