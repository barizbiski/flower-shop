import type { PublicUser } from '@flower-shop/shared';
import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../db/database.service.js';
import type { Queryable } from '../../../db/pool.js';
import { REFRESH_TTL_MS } from './auth.constants.js';
import { generateToken, hashToken } from './helpers/token.js';

/**
 * Refresh sessions. Each row of `sessions` is one refresh session, kept only on the server: `id` is
 * the SHA-256 hash of a random session token (the raw token only travels as the access token's
 * `sub`), `expires_at` its fixed 30-day expiry (never extended — no rotation), and `revoked_at` is
 * set by logout. Rows are deleted only by the expired-session cleanup.
 */
@Injectable()
export class SessionsRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  /** Creates a session row (storing only the hash) and returns the raw session token. */
  async create(userId: string, q: Queryable = this.db.pool): Promise<string> {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
    await q.query('INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)', [
      hashToken(token),
      userId,
      expiresAt,
    ]);
    return token;
  }

  /** Marks a session revoked (the row stays until it expires); a no-op for an unknown or already revoked token. */
  async revokeByToken(token: string, q: Queryable = this.db.pool): Promise<void> {
    await q.query('UPDATE sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL', [hashToken(token)]);
  }

  /**
   * The user behind a live session token, or null if it is unknown, revoked or expired. Read-only:
   * the fixed 30-day expiry is not extended.
   */
  async findUserByToken(token: string): Promise<PublicUser | null> {
    const { rows } = await this.db.pool.query<PublicUser>(
      `SELECT u.id, u.name, u.email::text AS email, u.phone
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.id = $1 AND s.revoked_at IS NULL AND s.expires_at > now()`,
      [hashToken(token)],
    );
    return rows[0] ?? null;
  }

  /**
   * Physically removes expired rows, revoked or not (they are already rejected by findUserByToken);
   * returns how many. A revoked row that hasn't expired yet is kept.
   */
  async deleteExpired(): Promise<number> {
    const { rowCount } = await this.db.pool.query('DELETE FROM sessions WHERE expires_at <= now()');
    return rowCount ?? 0;
  }
}
