/** Same-origin API paths (proxied to the backend by Vite in dev). */
export const API_ROUTES = {
  register: '/api/auth/register',
  login: '/api/auth/login',
  refresh: '/api/auth/refresh',
  logout: '/api/auth/logout',
  me: '/api/auth/me',
} as const;

/** Auth endpoints whose 401 means "not logged in" — the client never refreshes and retries them. */
export const NO_RETRY_ROUTES: ReadonlySet<string> = new Set([
  API_ROUTES.register,
  API_ROUTES.login,
  API_ROUTES.refresh,
  API_ROUTES.logout,
]);
