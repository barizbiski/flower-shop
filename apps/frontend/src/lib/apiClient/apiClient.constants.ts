import { AUTH_PATHS } from '@flower-shop/shared';

/** Auth endpoints whose 401 means "not logged in" — the client never refreshes and retries them. */
export const NO_RETRY_PATHS: ReadonlySet<string> = new Set([
  AUTH_PATHS.register,
  AUTH_PATHS.login,
  AUTH_PATHS.refresh,
  AUTH_PATHS.logout,
]);
