import type { PublicUser } from '@flower-shop/shared';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../features/auth/shared/AuthProvider';
import { useAuth } from '../features/auth/shared/useAuth';

/** The shopper the tests log in as. */
export const TEST_USER: PublicUser = { id: 'u1', name: 'Dana Levi', email: 'dana@example.com', phone: '0501234567' };

/** A fetch Response with a JSON body. */
export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

/** Replaces global fetch with a mock that answers every call with `status` and a JSON `body`. */
export function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockImplementation(async () => jsonResponse(status, body));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Catch-all route that shows where navigation ended up and who is logged in. */
function Landing() {
  const { user } = useAuth();
  const location = useLocation();
  return (
    <p>
      landed at {location.pathname} as {user?.name ?? 'nobody'}
    </p>
  );
}

/**
 * Renders `page` at `path` (logged out, starting at `url`), with a catch-all that shows
 * "landed at <path> as <name>" after a redirect.
 */
export function renderAuthPage(path: string, page: ReactElement, url: string = path) {
  return render(
    <AuthProvider initialUser={null}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path={path} element={page} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}
