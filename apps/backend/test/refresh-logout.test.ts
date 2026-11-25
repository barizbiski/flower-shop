import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { getMe, postAuth, refreshCookie, refreshTokenFrom, registerUser, type TestApp } from './helpers/auth.js';
import { startTestApp } from './helpers/testApp.js';

async function sessionCount(t: TestApp): Promise<number> {
  const { rows } = await t.db.query('SELECT count(*)::int AS n FROM sessions');
  return rows[0].n;
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

  // AC6
  it('returns 200 { accessToken, user } and rotates the refresh token (cookie)', async () => {
    const res = await postAuth(t, 'refresh', undefined, { refreshToken: session.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ accessToken: expect.any(String), user: session.user });
    const next = refreshTokenFrom(res)!;
    expect(next).toBeTruthy();
    expect(next).not.toBe(session.refreshToken);
    expect(await sessionCount(t)).toBe(1);
    expect((await getMe(t, res.body.accessToken)).status).toBe(200);
  });

  // AC6
  it('accepts the refresh token in the JSON body (non-browser clients)', async () => {
    const res = await postAuth(t, 'refresh', { refreshToken: session.refreshToken });
    expect(res.status).toBe(200);
  });

  // AC6
  it('rejects a refresh token that was already rotated', async () => {
    await postAuth(t, 'refresh', undefined, { refreshToken: session.refreshToken });
    const replay = await postAuth(t, 'refresh', undefined, { refreshToken: session.refreshToken });

    expect(replay.status).toBe(401);
    expect(replay.body.error.code).toBe('UNAUTHENTICATED');
  });

  // AC6
  it('lets only one of two concurrent refreshes with the same token win', async () => {
    const results = await Promise.all([
      postAuth(t, 'refresh', undefined, { refreshToken: session.refreshToken }),
      postAuth(t, 'refresh', undefined, { refreshToken: session.refreshToken }),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([200, 401]);
    expect(await sessionCount(t)).toBe(1);
  });

  // AC6
  it.each([
    ['missing', undefined],
    ['unknown', 'not-a-real-token'],
  ])('returns 401 UNAUTHENTICATED and clears the cookie when the token is %s', async (_case, refreshToken) => {
    const res = await postAuth(t, 'refresh', undefined, { refreshToken });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
    expect(refreshTokenFrom(res)).toBe('');
  });

  // AC6
  it('returns 401 for an expired refresh token', async () => {
    await t.db.query(`UPDATE sessions SET expires_at = now() - interval '1 second'`);
    const res = await postAuth(t, 'refresh', undefined, { refreshToken: session.refreshToken });
    expect(res.status).toBe(401);
  });

  // AC8
  it('rejects a refresh from a foreign Origin with 403 and keeps the token', async () => {
    const res = await postAuth(t, 'refresh', undefined, {
      refreshToken: session.refreshToken,
      origin: 'https://evil.example',
    });
    expect(res.status).toBe(403);
    expect(await sessionCount(t)).toBe(1);
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

  // AC7
  it('deletes the refresh token, clears the cookie and returns 204', async () => {
    const res = await postAuth(t, 'logout', undefined, { refreshToken: session.refreshToken });

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
    expect(refreshTokenFrom(res)).toBe('');
    expect(refreshCookie(res)).toMatch(/Path=\/api\/auth(;|$)/i);
    expect(refreshCookie(res)).toMatch(/Expires=Thu, 01 Jan 1970/i);
    expect(await sessionCount(t)).toBe(0);

    const refresh = await postAuth(t, 'refresh', undefined, { refreshToken: session.refreshToken });
    expect(refresh.status).toBe(401);
  });

  // AC7
  it.each([
    ['no', undefined],
    ['an unknown', 'not-a-real-token'],
  ])('returns 204 with %s refresh token', async (_case, refreshToken) => {
    const res = await postAuth(t, 'logout', undefined, { refreshToken });
    expect(res.status).toBe(204);
    expect(await sessionCount(t)).toBe(1);
  });

  // AC7
  it('accepts the refresh token in the JSON body', async () => {
    const res = await postAuth(t, 'logout', { refreshToken: session.refreshToken });
    expect(res.status).toBe(204);
    expect(await sessionCount(t)).toBe(0);
  });

  // AC7
  it('leaves an access token issued before logout valid until it expires', async () => {
    await postAuth(t, 'logout', undefined, { refreshToken: session.refreshToken });
    expect((await getMe(t, session.accessToken)).status).toBe(200);
  });

  // AC8
  it('rejects a logout from a foreign Origin with 403 and keeps the session', async () => {
    const res = await postAuth(t, 'logout', undefined, {
      refreshToken: session.refreshToken,
      origin: 'https://evil.example',
    });
    expect(res.status).toBe(403);
    expect(await sessionCount(t)).toBe(1);
  });
});
