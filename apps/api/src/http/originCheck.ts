import type { RequestHandler } from 'express';
import { HttpError } from './errors.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence for cookie sessions (alongside SameSite=Lax): state-changing requests must
 * carry an Origin header equal to the web app's origin. Browsers always send Origin on
 * cross-site and same-origin POSTs, so a missing header is treated as foreign.
 */
export function originCheck(webOrigin: string): RequestHandler {
  const allowed = new URL(webOrigin).origin;
  return (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    if (req.get('origin') === allowed) return next();
    next(new HttpError(403, 'FORBIDDEN_ORIGIN', 'Request origin not allowed'));
  };
}
