import request from 'supertest';
import type { startTestApp } from './testApp.js';
import { WEB_ORIGIN } from './testApp.js';

export type TestApp = Awaited<ReturnType<typeof startTestApp>>;

export const REFRESH_COOKIE = 'refresh_token';

export const validUser = {
  name: 'Dana Levi',
  email: '  Dana.Levi@Example.COM ',
  phone: '+972 50-123-4567',
  password: 'correct horse',
};

interface PostOptions {
  origin?: string | null;
  /** Raw refresh token to send as the refresh_token cookie. */
  refreshToken?: string;
}

/** POST to an /api/auth route the way the web app does (Origin header, optional refresh cookie). */
export function postAuth(t: TestApp, path: string, body?: unknown, opts: PostOptions = {}) {
  const req = request(t.app).post(`/api/auth/${path}`);
  const origin = opts.origin === undefined ? WEB_ORIGIN : opts.origin;
  if (origin) req.set('Origin', origin);
  if (opts.refreshToken) req.set('Cookie', `${REFRESH_COOKIE}=${opts.refreshToken}`);
  return body === undefined ? req : req.send(body as object);
}

export function getMe(t: TestApp, accessToken?: string) {
  const req = request(t.app).get('/api/auth/me');
  if (accessToken) req.set('Authorization', `Bearer ${accessToken}`);
  return req;
}

/** The full Set-Cookie line for the refresh cookie, if the response set one. */
export function refreshCookie(res: request.Response): string | undefined {
  const raw = res.headers['set-cookie'] as unknown as string[] | undefined;
  return raw?.find((c) => c.startsWith(`${REFRESH_COOKIE}=`));
}

/** The raw refresh token from the response's Set-Cookie (empty string when it was cleared). */
export function refreshTokenFrom(res: request.Response): string | undefined {
  const cookie = refreshCookie(res);
  return cookie === undefined ? undefined : decodeURIComponent(cookie.split(';')[0]!.slice(REFRESH_COOKIE.length + 1));
}

/** Registers `validUser` and returns the response's tokens and user. */
export async function registerUser(t: TestApp, overrides: Partial<typeof validUser> = {}) {
  const res = await postAuth(t, 'register', { ...validUser, ...overrides });
  if (res.status !== 201) throw new Error(`register failed: ${res.status}`);
  return { accessToken: res.body.accessToken as string, refreshToken: refreshTokenFrom(res)!, user: res.body.user };
}
