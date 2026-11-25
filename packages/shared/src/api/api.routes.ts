/** Every API route is served under /api. */
export const API_PREFIX = 'api';

/** /api — also the access-token cookie's Path. */
export const API_BASE_PATH = `/${API_PREFIX}`;

/** Controller path of the auth endpoints. */
export const AUTH_ROUTE = 'auth';

/** Auth endpoint paths, relative to /api/auth (what the Nest route decorators take). */
export const AUTH_ENDPOINTS = {
  register: 'register',
  login: 'login',
  refresh: 'refresh',
  logout: 'logout',
  me: 'me',
} as const;

/** /api/auth */
export const AUTH_BASE_PATH = `${API_BASE_PATH}/${AUTH_ROUTE}`;

type AuthEndpoint = keyof typeof AUTH_ENDPOINTS;

/** Full same-origin paths of the auth endpoints, e.g. /api/auth/login (what the web client calls). */
export const AUTH_PATHS = Object.fromEntries(
  Object.entries(AUTH_ENDPOINTS).map(([name, endpoint]) => [name, `${AUTH_BASE_PATH}/${endpoint}`]),
) as Record<AuthEndpoint, string>;
