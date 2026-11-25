import { createHash } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { startTestApp } from './testApp.js';
import { TEST_JWT_SECRET, WEB_ORIGIN } from './testApp.js';

export type TestApp = Awaited<ReturnType<typeof startTestApp>>;

export const ACCESS_COOKIE = 'access_token';
export const LEGACY_REFRESH_COOKIE = 'refresh_token';

export const validUser = {
  name: 'Dana Levi',
  email: '  Dana.Levi@Example.COM ',
  phone: '+972 50-123-4567',
  password: 'correct horse',
};

interface PostOptions {
  origin?: string | null;
  /** Access token (JWT) to send as the access_token cookie. */
  accessToken?: string;
}

/** POST to an /api/auth route the way the web app does (Origin header, optional access cookie). */
export function postAuth(t: TestApp, path: string, body?: unknown, opts: PostOptions = {}) {
  const req = request(t.app).post(`/api/auth/${path}`);
  const origin = opts.origin === undefined ? WEB_ORIGIN : opts.origin;
  if (origin) req.set('Origin', origin);
  if (opts.accessToken) req.set('Cookie', `${ACCESS_COOKIE}=${opts.accessToken}`);
  return body === undefined ? req : req.send(body as object);
}

/** GET /api/auth/me with the access token as the access_token cookie. */
export function getMe(t: TestApp, accessToken?: string) {
  const req = request(t.app).get('/api/auth/me');
  if (accessToken) req.set('Cookie', `${ACCESS_COOKIE}=${accessToken}`);
  return req;
}

/** The full Set-Cookie line for `name`, if the response set one. */
export function setCookie(res: request.Response, name: string): string | undefined {
  const raw = res.headers['set-cookie'] as unknown as string[] | undefined;
  return raw?.find((c) => c.startsWith(`${name}=`));
}

export function accessCookie(res: request.Response): string | undefined {
  return setCookie(res, ACCESS_COOKIE);
}

/** The access token from the response's Set-Cookie (empty string when it was cleared). */
export function accessTokenFrom(res: request.Response): string | undefined {
  const cookie = accessCookie(res);
  return cookie === undefined ? undefined : decodeURIComponent(cookie.split(';')[0]!.slice(ACCESS_COOKIE.length + 1));
}

/** Decoded header and payload of a JWT (signature not checked). */
export function decodeJwt(token: string): { header: Record<string, unknown>; payload: Record<string, unknown> } {
  const [header, payload] = token
    .split('.')
    .slice(0, 2)
    .map((part) => JSON.parse(Buffer.from(part, 'base64url').toString()) as Record<string, unknown>);
  return { header: header!, payload: payload! };
}

/** The `sessions` row id an access token points at: SHA-256 of its `sub`. */
export function sessionIdOf(accessToken: string): string {
  return createHash('sha256').update(String(decodeJwt(accessToken).payload.sub)).digest('hex');
}

/** Signs an HS256 JWT with the test secret (or another one), for forged / expired token cases. */
export function signJwt(payload: Record<string, unknown>, secret = TEST_JWT_SECRET): string {
  return new JwtService({ secret }).sign(payload);
}

/** Registers `validUser` and returns the response's access token and user. */
export async function registerUser(t: TestApp, overrides: Partial<typeof validUser> = {}) {
  const res = await postAuth(t, 'register', { ...validUser, ...overrides });
  if (res.status !== 201) throw new Error(`register failed: ${res.status}`);
  return { accessToken: accessTokenFrom(res)!, user: res.body.user };
}
