import type { PublicUser } from '@flower-shop/shared';
import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../db/database.service.js';
import type { Queryable } from '../../../db/pool.js';
import { REFRESH_TTL_MS } from './auth.constants.js';
import { generateToken, hashToken } from './helpers/token.js';

/**
 * Refresh tokens. Each row of `sessions` is one live refresh token: `id` is the token's SHA-256
 * hash (the raw token only ever lives on the client), `expires_at` its fixed 30-day expiry (set at
 * login/register, never extended — no rotation).
 */
@Injectable()
export class SessionsRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  /** Creates a refresh-token row (storing only the hash) and returns the raw token. */
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

  /** Deletes a refresh token's row; a no-op for an unknown token. */
  async deleteByToken(token: string, q: Queryable = this.db.pool): Promise<void> {
    await q.query('DELETE FROM sessions WHERE id = $1', [hashToken(token)]);
  }

  /**
   * The user behind a live refresh token, or null if the token is unknown or expired. Read-only:
   * the token is not rotated and its fixed 30-day expiry is not extended.
   */
  async findUserByToken(token: string): Promise<PublicUser | null> {
    const { rows } = await this.db.pool.query<PublicUser>(
      `SELECT u.id, u.name, u.email::text AS email, u.phone
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.id = $1 AND s.expires_at > now()`,
      [hashToken(token)],
    );
    return rows[0] ?? null;
  }

  /** Physically removes expired rows (they are already rejected by findUserByToken); returns how many. */
  async deleteExpired(): Promise<number> {
    const { rowCount } = await this.db.pool.query('DELETE FROM sessions WHERE expires_at <= now()');
    return rowCount ?? 0;
  }
}
