import type { Response } from 'express';
import { SESSION_COOKIE, SESSION_TTL_MS } from './auth.constants.js';

export function setSessionCookie(res: Response, token: string, secure: boolean): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
}
