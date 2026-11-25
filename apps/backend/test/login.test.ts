import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LEGACY_REFRESH_COOKIE,
  accessCookie,
  accessTokenFrom,
  decodeJwt,
  getMe,
  postAuth,
  registerUser,
  sessionIdOf,
  setCookie,
  signJwt,
  validUser,
  type TestApp,
} from './helpers/auth.js';
import { startTestApp } from './helpers/testApp.js';

const creds = { email: 'dana.levi@example.com', password: validUser.password };

function login(t: TestApp, body: unknown, opts?: Parameters<typeof postAuth>[3]) {
  return postAuth(t, 'login', body, opts);
}

describe('POST /api/auth/login', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await startTestApp();
  });
  afterAll(async () => {
    await t.stop();
  });
  beforeEach(async () => {
    await t.reset();
    await registerUser(t);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // AC3
  it('logs in with any email case and surrounding spaces: 200 { user } and an httpOnly access cookie', async () => {
    const res = await login(t, { email: '  DANA.Levi@example.COM ', password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      user: { id: expect.any(String), name: 'Dana Levi', email: 'dana.levi@example.com', phone: '+972501234567' },
    });

    const cookie = accessCookie(res)!;
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Path=\/api(;|$)/i);
    expect(cookie).toMatch(/Max-Age=2592000/i);
    expect(cookie).not.toMatch(/Secure/i);
    expect(setCookie(res, LEGACY_REFRESH_COOKIE)).toBeUndefined();
  });

  // AC3
  it('issues an HS256 JWT whose sub hashes to the session row id, with uid = user id, expiring after 15 minutes', async () => {
    const res = await login(t, creds);
    const accessToken = accessTokenFrom(res)!;
    const { header, payload } = decodeJwt(accessToken);

    expect(header.alg).toBe('HS256');
    expect(payload.uid).toBe(res.body.user.id);
    expect(payload.sub).not.toBe(res.body.user.id);
    expect((payload.exp as number) - (payload.iat as number)).toBe(15 * 60);

    const { rows } = await t.db.query('SELECT id, user_id, expires_at, revoked_at FROM sessions WHERE id = $1', [
      sessionIdOf(accessToken),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).not.toBe(payload.sub);
    expect(rows[0].user_id).toBe(res.body.user.id);
    expect(rows[0].revoked_at).toBeNull();
    const days = (new Date(rows[0].expires_at).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(29.9);
    expect(days).toBeLessThanOrEqual(30);
  });

  // AC3
  it('revokes (without deleting) the session the client already had', async () => {
    const first = accessTokenFrom(await login(t, creds))!;
    const second = await login(t, creds, { accessToken: first });

    expect(second.status).toBe(200);
    const { rows } = await t.db.query('SELECT id, revoked_at FROM sessions');
    const byId = new Map(rows.map((r) => [r.id, r.revoked_at]));
    expect(byId.get(sessionIdOf(first))).toBeInstanceOf(Date);
    expect(byId.get(sessionIdOf(accessTokenFrom(second)!))).toBeNull();
    expect((await postAuth(t, 'refresh', undefined, { accessToken: first })).status).toBe(401);
  });

  // AC4
  it.each([
    ['a wrong password', { ...creds, password: 'wrong password' }],
    ['an unknown email', { ...creds, email: 'nobody@example.com' }],
  ])('rejects %s with 401 INVALID_CREDENTIALS and the same message', async (_case, body) => {
    const res = await login(t, body);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password' } });
    expect(accessCookie(res)).toBeUndefined();
  });

  // AC4
  it.each([
    ['email', { password: 'x' }],
    ['email', { email: 'not-an-email', password: 'x' }],
    ['password', { email: creds.email }],
    ['password', { email: creds.email, password: '' }],
    ['password', { email: creds.email, password: 'x'.repeat(129) }],
  ])('rejects empty or malformed %s with 400 VALIDATION_ERROR', async (field, body) => {
    const res = await login(t, body);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(res.body.error.fields)).toEqual([field]);
  });

  // AC5
  // The limiter lives for the whole file's app, so rate-limit tests each use their own email.
  it('returns 429 after 5 failures for the same email + IP, even with the right password', async () => {
    const email = 'blocked@example.com';
    await registerUser(t, { email, phone: '+972502222222' });
    for (let i = 0; i < 5; i++) {
      expect((await login(t, { email, password: 'wrong password' })).status).toBe(401);
    }
    const blocked = await login(t, { email, password: validUser.password });

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' },
    });
    expect(accessCookie(blocked)).toBeUndefined();
  });

  // AC5
  it('lets the email in again once the 15-minute window has passed', async () => {
    const email = 'window@example.com';
    for (let i = 0; i < 5; i++) await login(t, { email, password: 'wrong password' });
    expect((await login(t, { email, password: 'wrong password' })).status).toBe(429);

    const realNow = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(realNow + 15 * 60 * 1000 + 1);
    expect((await login(t, { email, password: 'wrong password' })).status).toBe(401);
  });

  // AC5
  it('resets the failure count after a successful login', async () => {
    const email = 'reset@example.com';
    await registerUser(t, { email, phone: '+972501111111' });
    for (let i = 0; i < 4; i++) await login(t, { email, password: 'wrong password' });
    expect((await login(t, { email, password: validUser.password })).status).toBe(200);

    for (let i = 0; i < 4; i++) {
      expect((await login(t, { email, password: 'wrong password' })).status).toBe(401);
    }
  });

  // AC8
  it('rejects a login from a foreign Origin with 403', async () => {
    expect((await login(t, creds, { origin: 'https://evil.example' })).status).toBe(403);
    expect((await login(t, creds, { origin: null })).status).toBe(403);
  });

  // AC8
  it('never logs the password or tokens and never returns a token in the body', async () => {
    const spies = (['log', 'error', 'warn', 'info'] as const).map((m) => vi.spyOn(console, m));
    const res = await login(t, creds);
    await login(t, { ...creds, password: 'wrong password' });

    const accessToken = accessTokenFrom(res)!;
    const sessionToken = String(decodeJwt(accessToken).payload.sub);
    expect(Object.keys(res.body)).toEqual(['user']);
    expect(JSON.stringify(res.body)).not.toContain(sessionToken);
    for (const spy of spies) {
      for (const call of spy.mock.calls) {
        const line = JSON.stringify(call);
        for (const secret of [creds.password, 'wrong password', accessToken, sessionToken]) {
          expect(line).not.toContain(secret);
        }
      }
    }
  });
});

describe('GET /api/auth/me', () => {
  let t: TestApp;
  let user: { id: string };
  let accessToken: string;

  beforeAll(async () => {
    t = await startTestApp();
    ({ user, accessToken } = await registerUser(t));
  });
  afterAll(async () => {
    await t.stop();
  });

  // AC6
  it('returns 200 { user } for a valid access cookie', async () => {
    const res = await getMe(t, accessToken);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user });
  });

  // AC6
  it('ignores an Authorization: Bearer header', async () => {
    const res = await request(t.app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(401);
  });

  // AC6
  it.each([
    ['missing', undefined],
    ['malformed', 'not-a-jwt'],
    ['badly signed', signJwt({ sub: 'x', uid: 'y' }, randomBytes(32).toString('hex'))],
    ['expired', signJwt({ sub: 'x', uid: 'y', exp: Math.floor(Date.now() / 1000) - 1 })],
    ['missing uid', signJwt({ sub: 'x' })],
    ['alg=none', `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from('{"sub":"x","uid":"y"}').toString('base64url')}.`],
  ])('returns 401 UNAUTHENTICATED when the token is %s', async (_case, token) => {
    const res = await getMe(t, token);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  // AC6
  it('returns 401 once the access token is older than 15 minutes', async () => {
    const realNow = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(realNow + 15 * 60 * 1000 + 1000);
    try {
      expect((await getMe(t, accessToken)).status).toBe(401);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('returns 401 for a valid token whose user no longer exists', async () => {
    const orphan = signJwt({ sub: 'x', uid: '00000000-0000-0000-0000-000000000000' });
    expect((await getMe(t, orphan)).status).toBe(401);
  });
});
