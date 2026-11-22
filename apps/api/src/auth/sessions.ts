import { createHash, randomBytes } from 'node:crypto';
import type { Response } from 'express';
import type pg from 'pg';

export const SESSION_COOKIE = 'sid';
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Creates a session row (storing only the token's hash) and returns the raw token for the cookie. */
export async function createSession(client: pg.ClientBase | pg.Pool, userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await client.query('INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)', [
    hashToken(token),
    userId,
    expiresAt,
  ]);
  return token;
}

export function setSessionCookie(res: Response, token: string, secure: boolean): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
}
