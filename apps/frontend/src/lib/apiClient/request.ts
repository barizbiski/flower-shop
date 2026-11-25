import { NO_RETRY_PATHS } from './apiClient.constants';
import type { ApiResponse } from './apiClient.types';
import { refreshAccessToken } from './refresh';
import { send, type HttpMethod } from './send';

/** Sends the request; on a 401 (outside the auth endpoints) refreshes once and retries. */
async function request<T>(method: HttpMethod, path: string, payload?: unknown): Promise<ApiResponse<T>> {
  const first = await send(method, path, payload);
  if (first.status !== 401 || NO_RETRY_PATHS.has(path)) return first as ApiResponse<T>;
  const refreshed = await refreshAccessToken();
  if (refreshed.status !== 200) return first as ApiResponse<T>;
  return (await send(method, path, payload)) as ApiResponse<T>;
}

/**
 * GETs JSON from a same-origin API path (the access-token cookie is sent by the browser).
 * Resolves for any HTTP status; rejects only on network failure.
 */
export function getJson<T>(path: string): Promise<ApiResponse<T>> {
  return request<T>('GET', path);
}

/**
 * POSTs JSON to a same-origin API path (the access-token cookie is sent by the browser).
 * Resolves for any HTTP status; rejects only on network failure.
 */
export function postJson<T>(path: string, payload: unknown): Promise<ApiResponse<T>> {
  return request<T>('POST', path, payload);
}
