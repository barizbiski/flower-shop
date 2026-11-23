import { createHash } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { startTestApp, WEB_ORIGIN } from './helpers/testApp.js';

type TestApp = Awaited<ReturnType<typeof startTestApp>>;

const valid = {
  name: 'Dana Levi',
  email: '  Dana.Levi@Example.COM ',
  phone: '+972 50-123-4567',
  password: 'correct horse',
};

function register(t: TestApp, body: unknown, origin: string | null = WEB_ORIGIN) {
  const req = request(t.app).post('/api/auth/register');
  if (origin) req.set('Origin', origin);
  return req.send(body as object);
}

function sessionCookie(res: request.Response): string | undefined {
  const raw = res.headers['set-cookie'] as unknown as string[] | undefined;
  return raw?.find((c) => c.startsWith('sid='));
}

describe('POST /api/auth/register', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await startTestApp();
  });
  afterAll(async () => {
    await t.stop();
  });
  beforeEach(async () => {
    await t.reset();
  });

  // AC2
  it('creates the user, returns 201 with the public user, and sets a session cookie', async () => {
    const res = await register(t, valid);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      user: { id: expect.any(String), name: 'Dana Levi', email: 'dana.levi@example.com', phone: '+972501234567' },
    });
    expect(sessionCookie(res)).toBeDefined();

    const { rows } = await t.db.query('SELECT count(*)::int AS n FROM users');
    expect(rows[0].n).toBe(1);
  });

  // AC3
  it('trims and lowercases the email before saving', async () => {
    await register(t, valid);
    const { rows } = await t.db.query('SELECT email FROM users');
    expect(rows[0].email).toBe('dana.levi@example.com');
  });

  // AC3
  it('rejects an already-registered email in any letter case with 409 EMAIL_TAKEN', async () => {
    await register(t, valid);
    const res = await register(t, { ...valid, email: 'DANA.LEVI@example.com', name: 'Someone Else' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
    expect(sessionCookie(res)).toBeUndefined();
    const { rows } = await t.db.query('SELECT count(*)::int AS n FROM users');
    expect(rows[0].n).toBe(1);
  });

  // AC4
  it.each([
    ['name', { name: '   ' }],
    ['name', { name: 'x'.repeat(101) }],
    ['email', { email: 'not-an-email' }],
    ['phone', { phone: '12345678' }],
    ['phone', { phone: '1234567890123456' }],
    ['phone', { phone: '050-abc-4567' }],
    ['password', { password: 'short7!' }],
    ['password', { password: 'x'.repeat(129) }],
  ])('rejects invalid %s with 400 VALIDATION_ERROR and a field error', async (field, override) => {
    const res = await register(t, { ...valid, ...override });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(res.body.error.fields)).toEqual([field]);
    expect(sessionCookie(res)).toBeUndefined();
  });

  // AC4
  it('reports every missing field at once', async () => {
    const res = await register(t, {});
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.error.fields).sort()).toEqual(['email', 'name', 'password', 'phone']);
  });

  // AC5
  it('stores only an argon2id hash and never returns the password or hash', async () => {
    const log = vi.spyOn(console, 'log');
    const err = vi.spyOn(console, 'error');
    const res = await register(t, valid);

    const { rows } = await t.db.query('SELECT password_hash FROM users');
    const hash: string = rows[0].password_hash;
    expect(hash.startsWith('$argon2id$')).toBe(true);
    expect(hash).not.toContain(valid.password);

    const body = JSON.stringify(res.body);
    expect(body).not.toContain(valid.password);
    expect(body).not.toContain(hash);
    for (const call of [...log.mock.calls, ...err.mock.calls]) {
      expect(JSON.stringify(call)).not.toContain(valid.password);
    }
    log.mockRestore();
    err.mockRestore();
  });

  // AC6
  it('sets an HttpOnly, SameSite=Lax, 30-day cookie and stores only the token hash', async () => {
    const res = await register(t, valid);
    const cookie = sessionCookie(res)!;

    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Path=\//i);
    expect(cookie).not.toMatch(/Secure/i);
    expect(cookie).toMatch(/Max-Age=2592000/i);

    const token = decodeURIComponent(cookie.split(';')[0]!.slice('sid='.length));
    expect(token.length).toBeGreaterThanOrEqual(43);

    const { rows } = await t.db.query('SELECT id, user_id, expires_at FROM sessions');
    expect(rows).toHaveLength(1);
    expect(rows[0].id).not.toBe(token);
    expect(rows[0].id).toBe(createHash('sha256').update(token).digest('hex'));
    expect(rows[0].user_id).toBe(res.body.user.id);
    const days = (new Date(rows[0].expires_at).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(29.9);
    expect(days).toBeLessThanOrEqual(30);
  });

  // AC7
  it('rejects a request from a foreign Origin with 403 and creates nothing', async () => {
    const res = await register(t, valid, 'https://evil.example');

    expect(res.status).toBe(403);
    const { rows } = await t.db.query('SELECT count(*)::int AS n FROM users');
    expect(rows[0].n).toBe(0);
  });

  // AC7
  it('rejects a state-changing request with no Origin header', async () => {
    const res = await register(t, valid, null);
    expect(res.status).toBe(403);
  });
});

describe('POST /api/auth/register in production', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await startTestApp({ secureCookies: true });
  });
  afterAll(async () => {
    await t.stop();
  });

  // AC6
  it('marks the session cookie Secure', async () => {
    const res = await register(t, valid);
    expect(sessionCookie(res)).toMatch(/Secure/i);
  });
});
