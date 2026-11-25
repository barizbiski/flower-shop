import { describe, expect, it, vi } from 'vitest';
import { jsonResponse as json } from '../../test/helpers';
import { getJson, postJson, refreshAccessToken, setSessionExpiredHandler } from '.';

function init(call: unknown[]): RequestInit & { headers: Record<string, string> } {
  return call[1] as RequestInit & { headers: Record<string, string> };
}

describe('apiClient', () => {
  // The access token is an httpOnly cookie: the client never sets an Authorization header.
  it('sends same-origin credentials and no Authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { user: {} }));
    vi.stubGlobal('fetch', fetchMock);
    await getJson('/api/auth/me');
    expect(init(fetchMock.mock.calls[0]!).credentials).toBe('same-origin');
    expect(init(fetchMock.mock.calls[0]!).headers.Authorization).toBeUndefined();
  });

  // AC6: on 401 refresh once (shared by concurrent calls) and retry
  it('refreshes once for concurrent 401s and retries', async () => {
    let refreshed = false;
    const fetchMock = vi.fn(async (path: string) => {
      if (path === '/api/auth/refresh') {
        refreshed = true;
        return json(200, { user: {} });
      }
      return refreshed ? json(200, { ok: true }) : json(401, {});
    });
    vi.stubGlobal('fetch', fetchMock);

    const [a, b] = await Promise.all([getJson('/api/things'), postJson('/api/other', {})]);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(fetchMock.mock.calls.filter(([p]) => p === '/api/auth/refresh')).toHaveLength(1);
  });

  // AC6: refresh failure reports the session as expired
  it('logs out when the refresh fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(401, {}));
    vi.stubGlobal('fetch', fetchMock);
    const onExpired = vi.fn();
    setSessionExpiredHandler(onExpired);

    const res = await getJson('/api/things');

    expect(res.status).toBe(401);
    expect(onExpired).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never refreshes and retries the auth endpoints', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(401, {}));
    vi.stubGlobal('fetch', fetchMock);
    await postJson('/api/auth/login', { email: 'a@b.co', password: 'x' });
    await refreshAccessToken();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
