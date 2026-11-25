import { API_ROUTES } from '../../constants/api';
import type { ApiResponse } from '../../types/api';
import { hasAccessToken } from './guards';
import { send } from './send';
import { notifySessionExpired, setAccessToken } from './session';

/** Single in-flight refresh shared by concurrent callers. */
let refreshInFlight: Promise<ApiResponse<unknown>> | null = null;

/**
 * POSTs to /api/auth/refresh (the refresh token travels in the httpOnly cookie) and stores the new
 * access token. Concurrent callers share one request. A 401 clears the token and reports the
 * session as expired. Rejects only on network failure.
 */
export function refreshAccessToken<T>(): Promise<ApiResponse<T>> {
  refreshInFlight ??= (async () => {
    try {
      const result = await send('POST', API_ROUTES.refresh, {});
      if (result.status === 200 && hasAccessToken(result.body)) {
        setAccessToken(result.body.accessToken);
      } else {
        setAccessToken(null);
        if (result.status === 401) notifySessionExpired();
      }
      return result;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight as Promise<ApiResponse<T>>;
}
