import type { ApiErrorBody } from '@flower-shop/shared';

export interface ApiResponse<T> {
  status: number;
  /** Parsed JSON body, or null when the response had no valid JSON. */
  body: T | ApiErrorBody | null;
}
