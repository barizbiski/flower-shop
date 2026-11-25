import type { ApiErrorBody } from '@flower-shop/shared';
import type { ApiResponse } from './apiClient.types';

export type HttpMethod = 'GET' | 'POST';

/**
 * One same-origin fetch; the browser attaches the httpOnly access-token cookie. No retry.
 * Resolves for any HTTP status (body is null when it isn't valid JSON); rejects only on network failure.
 */
export async function send(method: HttpMethod, path: string, payload?: unknown): Promise<ApiResponse<unknown>> {
  const headers: Record<string, string> = {};
  if (payload !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => null)) as unknown;
  return { status: res.status, body: body as ApiErrorBody | null };
}
