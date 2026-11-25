export { API_MESSAGES } from './api/api.messages.js';
export { API_BASE_PATH, API_PREFIX, AUTH_BASE_PATH, AUTH_ENDPOINTS, AUTH_PATHS, AUTH_ROUTE } from './api/api.routes.js';
export type { ApiErrorBody, FieldErrors } from './api/api.types.js';
export { ERROR_CODES, type ErrorCode } from './api/error-codes.js';
export {
  EMAIL_MAX_LENGTH,
  EMAIL_RE,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_RE,
  PHONE_SEPARATORS_RE,
} from './auth/auth.constants.js';
export { LOGIN_MESSAGES, REGISTER_MESSAGES } from './auth/auth.messages.js';
export type { AuthResponse, PublicUser } from './auth/auth.types.js';
