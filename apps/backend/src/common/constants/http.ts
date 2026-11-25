/** Every route is served under /api. */
export const API_PREFIX = 'api';

/** Max JSON request body size. */
export const JSON_BODY_LIMIT = '10kb';

/** Methods that don't change state, so they skip the Origin (CSRF) check. */
export const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
