import { API_ROUTES } from '../../../constants/api';
import { getJson, postJson, refreshAccessToken, setAccessToken } from '../../../lib/apiClient';
import type { AuthTokenResponse, User } from './auth.types';

/** True for the `{ accessToken, user }` body that register, login and refresh return. */
export function isTokenResponse(body: unknown): body is AuthTokenResponse {
  return typeof body === 'object' && body !== null && 'user' in body && 'accessToken' in body;
}

/** Restores the session from the refresh cookie; resolves to the user, or null when logged out. */
export async function refreshSession(): Promise<User | null> {
  try {
    const { status, body } = await refreshAccessToken<AuthTokenResponse>();
    return status === 200 && isTokenResponse(body) ? body.user : null;
  } catch {
    return null;
  }
}

/** Ends the session on the server (best effort) and always drops the access token. */
export async function logoutUser(): Promise<void> {
  try {
    await postJson<null>(API_ROUTES.logout, {});
  } catch {
    // Network failure: still log out locally.
  } finally {
    setAccessToken(null);
  }
}

export async function fetchMe(): Promise<User | null> {
  try {
    const { status, body } = await getJson<{ user: User }>(API_ROUTES.me);
    return status === 200 && body && 'user' in body ? body.user : null;
  } catch {
    return null;
  }
}
