import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../db/database.service.js';
import type { Queryable } from '../../../db/pool.js';
import { SESSION_TTL_MS } from './auth.constants.js';
import { generateToken, hashToken } from './helpers/token.js';

@Injectable()
export class SessionsRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  /** Creates a session row (storing only the token's hash) and returns the raw token for the cookie. */
  async create(userId: string, q: Queryable = this.db.pool): Promise<string> {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await q.query('INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)', [
      hashToken(token),
      userId,
      expiresAt,
    ]);
    return token;
  }
}
