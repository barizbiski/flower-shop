/** Messages any endpoint may return. */
export const API_MESSAGES = {
  /** 400 VALIDATION_ERROR; the per-field messages are in `error.fields`. */
  formInvalid: 'Please fix the highlighted fields',
} as const;
