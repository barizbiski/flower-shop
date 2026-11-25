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
  type TestApp,
} from './helpers/auth.js';
import { startTestApp } from './helpers/testApp.js';

async function sessionCount(t: TestApp): Promise<number> {
  const { rows } = await t.db.query('SELECT count(*)::int AS n FROM sessions');
  return rows[0].n;
}

async function sessionRow(t: TestApp) {
  const { rows } = await t.db.query('SELECT id, user_id, expires_at, revoked_at FROM sessions');
  return rows[0];
}

/** Moves the clock past the access token's 15-minute expiry. */
function afterAccessTokenExpiry() {
  const realNow = Date.now();
  vi.spyOn(Date, 'now').mockReturnValue(realNow + 15 * 60 * 1000 + 1000);
}

describe('POST /api/auth/refresh', () => {
  let t: TestApp;
  let session: Awaited<ReturnType<typeof registerUser>>;

  beforeAll(async () => {
    t = await startTestApp();
  });
  afterAll(async () => {
    await t.stop();
  });
  beforeEach(async () => {
    await t.reset();
    session = await registerUser(t);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 200 { user } and a new access cookie for the same session; the row is unchanged', async () => {
    const before = await sessionRow(t);
    const res = await postAuth(t, 'refresh', undefined, { accessToken: session.accessToken });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: session.user });
    const renewed = accessTokenFrom(res)!;
    expect(renewed).toBeTruthy();
    expect(decodeJwt(renewed).payload.sub).toBe(decodeJwt(session.accessToken).payload.sub);
    expect(await sessionRow(t)).toEqual(before);
    expect((await getMe(t, renewed)).status).toBe(200);
  });

  it('refreshes with an access token that has already expired', async () => {
    afterAccessTokenExpiry();
    expect((await getMe(t, session.accessToken)).status).toBe(401);

    const res = await postAuth(t, 'refresh', undefined, { accessToken: session.accessToken });
    expect(res.status).toBe(200);
    expect((await getMe(t, accessTokenFrom(res))).status).toBe(200);
  });

  it('ignores a refresh token in the body (it is never sent to clients)', async () => {
    const res = await postAuth(t, 'refresh', { refreshToken: 'anything' });
    expect(res.status).toBe(401);
  });

  it('keeps the same session usable for repeated and concurrent refreshes', async () => {
    for (let i = 0; i < 3; i++) {
      expect((await postAuth(t, 'refresh', undefined, { accessToken: session.accessToken })).status).toBe(200);
    }
    const results = await Promise.all([
      postAuth(t, 'refresh', undefined, { accessToken: session.accessToken }),
      postAuth(t, 'refresh', undefined, { accessToken: session.accessToken }),
    ]);
    expect(results.map((r) => r.status)).toEqual([200, 200]);
    expect(await sessionCount(t)).toBe(1);
  });

  it.each([
    ['missing', () => undefined],
    ['malformed', () => 'not-a-jwt'],
    ['signed with another secret', () => signJwt({ sub: 'x', uid: 'y' }, 'another-secret-another-secret-123')],
    ['for an unknown session', () => signJwt({ sub: 'not-a-real-session', uid: 'y' })],
  ])('returns 401 UNAUTHENTICATED and clears the cookie when the access token is %s', async (_case, token) => {
    const res = await postAuth(t, 'refresh', undefined, { accessToken: token() });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
    expect(accessTokenFrom(res)).toBe('');
  });

  it('rejects a forged token that points at a real session', async () => {
    const forged = signJwt(decodeJwt(session.accessToken).payload, 'another-secret-another-secret-123');
    expect((await postAuth(t, 'refresh', undefined, { accessToken: forged })).status).toBe(401);
  });

  it('returns 401 once the session has passed its 30-day expiry', async () => {
    await t.db.query(`UPDATE sessions SET expires_at = now() - interval '1 second'`);
    const res = await postAuth(t, 'refresh', undefined, { accessToken: session.accessToken });
    expect(res.status).toBe(401);
  });

  it('rejects a refresh from a foreign Origin with 403', async () => {
    const res = await postAuth(t, 'refresh', undefined, {
      accessToken: session.accessToken,
      origin: 'https://evil.example',
    });
    expect(res.status).toBe(403);
  });
});

describe('POST /api/auth/logout', () => {
  let t: TestApp;
  let session: Awaited<ReturnType<typeof registerUser>>;

  beforeAll(async () => {
    t = await startTestApp();
  });
  afterAll(async () => {
    await t.stop();
  });
  beforeEach(async () => {
    await t.reset();
    session = await registerUser(t);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('revokes the session without deleting it, clears the cookies and returns 204', async () => {
    const res = await postAuth(t, 'logout', undefined, { accessToken: session.accessToken });

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    expect(accessTokenFrom(res)).toBe('');
    expect(accessCookie(res)).toMatch(/Path=\/api(;|$)/i);
    expect(accessCookie(res)).toMatch(/Expires=Thu, 01 Jan 1970/i);
    expect(setCookie(res, LEGACY_REFRESH_COOKIE)).toMatch(/Path=\/api\/auth(;|$)/i);

    const row = await sessionRow(t);
    expect(row.id).toBe(sessionIdOf(session.accessToken));
    expect(row.revoked_at).toBeInstanceOf(Date);
  });

  it('stops the access token from being refreshed after logout', async () => {
    await postAuth(t, 'logout', undefined, { accessToken: session.accessToken });
    const refresh = await postAuth(t, 'refresh', undefined, { accessToken: session.accessToken });
    expect(refresh.status).toBe(401);
  });

  it('revokes the session even when the access token has already expired', async () => {
    afterAccessTokenExpiry();
    await postAuth(t, 'logout', undefined, { accessToken: session.accessToken });
    expect((await sessionRow(t)).revoked_at).toBeInstanceOf(Date);
  });

  it('is idempotent: a second logout keeps the first revocation time', async () => {
    await postAuth(t, 'logout', undefined, { accessToken: session.accessToken });
    const first = (await sessionRow(t)).revoked_at;
    const again = await postAuth(t, 'logout', undefined, { accessToken: session.accessToken });
    expect(again.status).toBe(204);
    expect((await sessionRow(t)).revoked_at).toEqual(first);
  });

  it.each([
    ['no', undefined],
    ['a malformed', 'not-a-jwt'],
  ])('returns 204 with %s access token and leaves the session alone', async (_case, accessToken) => {
    const res = await postAuth(t, 'logout', undefined, { accessToken });
    expect(res.status).toBe(204);
    expect((await sessionRow(t)).revoked_at).toBeNull();
  });

  it('leaves an access token issued before logout valid on protected routes until it expires', async () => {
    await postAuth(t, 'logout', undefined, { accessToken: session.accessToken });
    expect((await getMe(t, session.accessToken)).status).toBe(200);
  });

  it('rejects a logout from a foreign Origin with 403 and keeps the session live', async () => {
    const res = await postAuth(t, 'logout', undefined, {
      accessToken: session.accessToken,
      origin: 'https://evil.example',
    });
    expect(res.status).toBe(403);
    expect((await sessionRow(t)).revoked_at).toBeNull();
  });
});
