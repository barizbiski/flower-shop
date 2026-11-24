import { createHash, randomBytes } from 'node:crypto';
import { REFRESH_TOKEN_BYTES } from '../auth.constants.js';

/** New random refresh token (URL-safe). */
export function generateToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
}

/** SHA-256 hex digest of a token; this is what the sessions table stores. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
