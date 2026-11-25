import type { CookieOptions, Request, Response } from 'express';
import { REFRESH_COOKIE, REFRESH_COOKIE_PATH, REFRESH_TOKEN_BODY_FIELD, REFRESH_TTL_MS } from './auth.constants.js';

function cookieOptions(secure: boolean): CookieOptions {
  return { httpOnly: true, sameSite: 'lax', secure, path: REFRESH_COOKIE_PATH };
}

export function setRefreshCookie(res: Response, token: string, secure: boolean): void {
  res.cookie(REFRESH_COOKIE, token, { ...cookieOptions(secure), maxAge: REFRESH_TTL_MS });
}

/** Clears the cookie; the options must match the ones it was set with or the browser keeps it. */
export function clearRefreshCookie(res: Response, secure: boolean): void {
  res.clearCookie(REFRESH_COOKIE, cookieOptions(secure));
}

/** The raw refresh token from the httpOnly cookie (web) or the JSON body (non-browser clients). */
export function readRefreshToken(req: Request): string | undefined {
  const fromCookie: unknown = req.cookies?.[REFRESH_COOKIE];
  if (typeof fromCookie === 'string' && fromCookie) return fromCookie;
  const fromBody: unknown = (req.body as Record<string, unknown> | undefined)?.[REFRESH_TOKEN_BODY_FIELD];
  if (typeof fromBody === 'string' && fromBody) return fromBody;
  return undefined;
}
