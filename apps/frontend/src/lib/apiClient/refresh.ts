import { AUTH_PATHS } from '@flower-shop/shared';
import type { ApiResponse } from './apiClient.types';
import { send } from './send';
import { notifySessionExpired } from './session';

/** Single in-flight refresh shared by concurrent callers. */
let refreshInFlight: Promise<ApiResponse<unknown>> | null = null;

/**
 * POSTs to /api/auth/refresh. The browser sends the (possibly expired) access-token cookie, and a
 * 200 sets a new one. Concurrent callers share one request. A 401 reports the session as expired.
 * Rejects only on network failure.
 */
export function refreshAccessToken<T>(): Promise<ApiResponse<T>> {
  refreshInFlight ??= (async () => {
    try {
      const result = await send('POST', AUTH_PATHS.refresh);
      if (result.status === 401) notifySessionExpired();
      return result;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight as Promise<ApiResponse<T>>;
}
