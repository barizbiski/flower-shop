import type { ApiErrorBody, ApiResponse } from '../types/api';

export function isApiError(body: unknown): body is ApiErrorBody {
  return typeof body === 'object' && body !== null && 'error' in body;
}

/**
 * POSTs JSON to a same-origin API path (session cookie included).
 * Resolves for any HTTP status; rejects only on network failure.
 */
export async function postJson<T>(path: string, payload: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => null)) as T | ApiErrorBody | null;
  return { status: res.status, body };
}
