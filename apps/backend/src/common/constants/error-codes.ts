/** Machine-readable `error.code` values in the API's error envelope. */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  FORBIDDEN_ORIGIN: 'FORBIDDEN_ORIGIN',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL: 'INTERNAL',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
