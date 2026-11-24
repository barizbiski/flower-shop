/** Field-level validation messages, keyed by request field name. */
export type FieldErrors = Record<string, string>;

/** Error envelope returned by the server: { error: { code, message, fields? } }. */
export interface ApiErrorBody {
  error: { code: string; message: string; fields?: FieldErrors };
}

export interface ApiResponse<T> {
  status: number;
  /** Parsed JSON body, or null when the response had no valid JSON. */
  body: T | ApiErrorBody | null;
}
