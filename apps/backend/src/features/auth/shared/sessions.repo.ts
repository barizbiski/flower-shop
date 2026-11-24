import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../db/database.service.js';
import type { Queryable } from '../../../db/pool.js';
import { REFRESH_TTL_MS } from './auth.constants.js';
import type { IssuedSession, PublicUser } from './auth.types.js';
import { generateToken, hashToken } from './helpers/token.js';

/**
 * Refresh tokens. Each row of `sessions` is one live refresh token: `id` is the token's SHA-256
 * hash (the raw token only ever lives on the client), `expires_at` its 30-day expiry.
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
   * Swaps a live refresh token for a new one in one transaction: the old row is deleted and a new
   * one created. Returns the user and the new raw token, or null if the old token is unknown,
   * expired or already rotated. The DELETE row lock makes concurrent rotations of the same token
   * safe — only the first one wins.
   */
  async rotate(token: string): Promise<IssuedSession | null> {
    return this.db.transaction(async (client) => {
      const { rows } = await client.query<PublicUser>(
        `DELETE FROM sessions s USING users u
          WHERE s.id = $1 AND s.user_id = u.id AND s.expires_at > now()
          RETURNING u.id, u.name, u.email::text AS email, u.phone`,
        [hashToken(token)],
      );
      const user = rows[0];
      if (!user) return null;
      const refreshToken = await this.create(user.id, client);
      return { user, refreshToken };
    });
  }
}
