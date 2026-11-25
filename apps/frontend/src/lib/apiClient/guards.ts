import type { ApiErrorBody, AuthResponse } from '@flower-shop/shared';

/** True for the server's error envelope: `{ error: { code, message, fields? } }`. */
export function isApiError(body: unknown): body is ApiErrorBody {
  return typeof body === 'object' && body !== null && 'error' in body;
}

/** True for the `{ user }` body that register, login and refresh return. */
export function isAuthResponse(body: unknown): body is AuthResponse {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as { user?: unknown }).user === 'object' &&
    (body as { user?: unknown }).user !== null
  );
}
