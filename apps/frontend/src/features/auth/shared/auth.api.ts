import { AUTH_PATHS, type AuthResponse, type PublicUser } from '@flower-shop/shared';
import {
  getJson,
  isApiError,
  isAuthResponse,
  postJson,
  refreshAccessToken,
  setAccessToken,
} from '../../../lib/apiClient';
import type { CredentialsResponse } from './auth.types';

/**
 * POSTs register or login credentials. On `successStatus` with `{ accessToken, user }` stores the
 * access token; a 400 with field errors is returned as `invalid`; anything else as its status.
 */
export async function postCredentials(path: string, values: unknown, successStatus: number): Promise<CredentialsResponse> {
  try {
    const { status, body } = await postJson<AuthResponse>(path, values);
    if (status === successStatus && isAuthResponse(body)) {
      setAccessToken(body.accessToken);
      return { ok: true, user: body.user };
    }
    if (status === 400 && isApiError(body) && body.error.fields) {
      return { ok: false, kind: 'invalid', fields: body.error.fields };
    }
    return { ok: false, kind: 'status', status };
  } catch {
    return { ok: false, kind: 'status', status: 0 };
  }
}

/** Restores the session from the refresh cookie; resolves to the user, or null when logged out. */
export async function refreshSession(): Promise<PublicUser | null> {
  try {
    const { status, body } = await refreshAccessToken<AuthResponse>();
    return status === 200 && isAuthResponse(body) ? body.user : null;
  } catch {
    return null;
  }
}

/** Ends the session on the server (best effort) and always drops the access token. */
export async function logoutUser(): Promise<void> {
  try {
    await postJson<null>(AUTH_PATHS.logout, {});
  } catch {
    // Network failure: still log out locally.
  } finally {
    setAccessToken(null);
  }
}

export async function fetchMe(): Promise<PublicUser | null> {
  try {
    const { status, body } = await getJson<{ user: PublicUser }>(AUTH_PATHS.me);
    return status === 200 && body && 'user' in body ? body.user : null;
  } catch {
    return null;
  }
}
