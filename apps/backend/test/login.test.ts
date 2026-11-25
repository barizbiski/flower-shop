import { createHash, randomBytes } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getMe,
  postAuth,
  refreshCookie,
  refreshTokenFrom,
  registerUser,
  validUser,
  type TestApp,
} from './helpers/auth.js';
import { startTestApp, TEST_JWT_SECRET } from './helpers/testApp.js';

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
  it('logs in with any email case and surrounding spaces: 200, access token, user, refresh cookie', async () => {
    const res = await login(t, { email: '  DANA.Levi@example.COM ', password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      accessToken: expect.any(String),
      user: { id: expect.any(String), name: 'Dana Levi', email: 'dana.levi@example.com', phone: '+972501234567' },
    });

    const cookie = refreshCookie(res)!;
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Path=\/api\/auth(;|$)/i);
    expect(cookie).toMatch(/Max-Age=2592000/i);
    expect(cookie).not.toMatch(/Secure/i);

    const token = refreshTokenFrom(res)!;
    const { rows } = await t.db.query('SELECT id FROM sessions WHERE id = $1', [
      createHash('sha256').update(token).digest('hex'),
    ]);
    expect(rows).toHaveLength(1);
  });

  // AC3
  it('issues an HS256 JWT with sub = user id that expires after 15 minutes', async () => {
    const res = await login(t, creds);
    const [header, payload] = (res.body.accessToken as string)
      .split('.')
      .slice(0, 2)
      .map((part) => JSON.parse(Buffer.from(part, 'base64url').toString()));

    expect(header.alg).toBe('HS256');
    expect(payload.sub).toBe(res.body.user.id);
    expect(payload.exp - payload.iat).toBe(15 * 60);
  });

  // AC3
  it('replaces the refresh token the client already had', async () => {
    const first = refreshTokenFrom(await login(t, creds))!;
    const second = await login(t, creds, { refreshToken: first });

    expect(second.status).toBe(200);
    const { rows } = await t.db.query('SELECT id FROM sessions');
    const ids = rows.map((r) => r.id);
    expect(ids).not.toContain(createHash('sha256').update(first).digest('hex'));
    expect(ids).toContain(createHash('sha256').update(refreshTokenFrom(second)!).digest('hex'));
  });

  // AC4
  it.each([
    ['a wrong password', { ...creds, password: 'wrong password' }],
    ['an unknown email', { ...creds, email: 'nobody@example.com' }],
  ])('rejects %s with 401 INVALID_CREDENTIALS and the same message', async (_case, body) => {
    const res = await login(t, body);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password' } });
    expect(refreshCookie(res)).toBeUndefined();
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
    expect(refreshCookie(blocked)).toBeUndefined();
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
  it('never logs the password or tokens and never returns the refresh token in the body', async () => {
    const spies = (['log', 'error', 'warn', 'info'] as const).map((m) => vi.spyOn(console, m));
    const res = await login(t, creds);
    await login(t, { ...creds, password: 'wrong password' });

    const refreshToken = refreshTokenFrom(res)!;
    expect(JSON.stringify(res.body)).not.toContain(refreshToken);
    for (const spy of spies) {
      for (const call of spy.mock.calls) {
        const line = JSON.stringify(call);
        for (const secret of [creds.password, 'wrong password', refreshToken, res.body.accessToken]) {
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
  it('returns 200 { user } for a valid Bearer access token', async () => {
    const res = await getMe(t, accessToken);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user });
  });

  // AC6
  it.each([
    ['missing', undefined],
    ['malformed', 'not-a-jwt'],
    ['badly signed', new JwtService({ secret: randomBytes(32).toString('hex') }).sign({ sub: 'x' })],
    ['expired', new JwtService({ secret: TEST_JWT_SECRET }).sign({ sub: 'x', exp: Math.floor(Date.now() / 1000) - 1 })],
    ['alg=none', `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from('{"sub":"x"}').toString('base64url')}.`],
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
    const orphan = new JwtService({ secret: TEST_JWT_SECRET }).sign({ sub: '00000000-0000-0000-0000-000000000000' });
    expect((await getMe(t, orphan)).status).toBe(401);
  });
});
