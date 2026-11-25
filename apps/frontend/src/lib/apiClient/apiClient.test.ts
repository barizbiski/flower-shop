import { describe, expect, it, vi } from 'vitest';
import { getJson, postJson, refreshAccessToken, setAccessToken, setSessionExpiredHandler } from '.';

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

function authHeader(call: unknown[]): string | undefined {
  return (call[1] as RequestInit & { headers: Record<string, string> }).headers.Authorization;
}

describe('apiClient', () => {
  // AC6: Bearer header from the in-memory access token
  it('sends the access token as a Bearer header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { user: {} }));
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('at-1');
    await getJson('/api/auth/me');
    expect(authHeader(fetchMock.mock.calls[0]!)).toBe('Bearer at-1');
  });

  // AC6: on 401 refresh once (shared by concurrent calls) and retry
  it('refreshes once for concurrent 401s and retries with the new token', async () => {
    const fetchMock = vi.fn(async (path: string, init: RequestInit & { headers: Record<string, string> }) => {
      if (path === '/api/auth/refresh') return json(200, { accessToken: 'new', user: {} });
      return init.headers.Authorization === 'Bearer new' ? json(200, { ok: true }) : json(401, {});
    });
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('old');

    const [a, b] = await Promise.all([getJson('/api/things'), postJson('/api/other', {})]);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(fetchMock.mock.calls.filter(([p]) => p === '/api/auth/refresh')).toHaveLength(1);
  });

  // AC6: refresh failure clears the token and reports the session as expired
  it('logs out when the refresh fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(401, {}));
    vi.stubGlobal('fetch', fetchMock);
    const onExpired = vi.fn();
    setSessionExpiredHandler(onExpired);
    setAccessToken('old');

    const res = await getJson('/api/things');

    expect(res.status).toBe(401);
    expect(onExpired).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await getJson('/api/things').catch(() => undefined);
    expect(authHeader(fetchMock.mock.calls[2]!)).toBeUndefined();
  });

  it('never refreshes and retries the auth endpoints', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(401, {}));
    vi.stubGlobal('fetch', fetchMock);
    await postJson('/api/auth/login', { email: 'a@b.co', password: 'x' });
    await refreshAccessToken();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
