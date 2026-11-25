import type { CookieOptions, Request, Response } from 'express';
import {
  ACCESS_COOKIE,
  ACCESS_COOKIE_MAX_AGE_MS,
  ACCESS_COOKIE_PATH,
  LEGACY_REFRESH_COOKIE,
  LEGACY_REFRESH_COOKIE_PATH,
} from './auth.constants.js';

function cookieOptions(secure: boolean, path: string): CookieOptions {
  return { httpOnly: true, sameSite: 'lax', secure, path };
}

export function setAccessCookie(res: Response, accessToken: string, secure: boolean): void {
  res.cookie(ACCESS_COOKIE, accessToken, { ...cookieOptions(secure, ACCESS_COOKIE_PATH), maxAge: ACCESS_COOKIE_MAX_AGE_MS });
}

/**
 * Clears the access cookie, and the previous design's refresh cookie so it doesn't linger. The
 * options must match the ones a cookie was set with or the browser keeps it.
 */
export function clearAuthCookies(res: Response, secure: boolean): void {
  res.clearCookie(ACCESS_COOKIE, cookieOptions(secure, ACCESS_COOKIE_PATH));
  res.clearCookie(LEGACY_REFRESH_COOKIE, cookieOptions(secure, LEGACY_REFRESH_COOKIE_PATH));
}

/** The raw access token (JWT) from the httpOnly cookie, if any. */
export function readAccessToken(req: Request): string | undefined {
  const value: unknown = req.cookies?.[ACCESS_COOKIE];
  return typeof value === 'string' && value ? value : undefined;
}
