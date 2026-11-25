import type { ApiErrorBody } from '../../types/api';

/** True for the server's error envelope: `{ error: { code, message, fields? } }`. */
export function isApiError(body: unknown): body is ApiErrorBody {
  return typeof body === 'object' && body !== null && 'error' in body;
}

/** True for a body carrying a string `accessToken` (register, login, refresh). */
export function hasAccessToken(body: unknown): body is { accessToken: string } {
  return typeof body === 'object' && body !== null && typeof (body as { accessToken?: unknown }).accessToken === 'string';
}
