import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service.js';
import type { Queryable } from '../db/pool.js';
import { PG_UNIQUE_VIOLATION } from './auth.constants.js';
import type { NewUser, PublicUser } from './auth.types.js';

export class EmailTakenError extends Error {}

@Injectable()
export class UsersRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  /** Inserts a user; pass a transaction client as `q` to run inside a transaction. */
  async insert(user: NewUser, q: Queryable = this.db.pool): Promise<PublicUser> {
    try {
      const { rows } = await q.query<PublicUser>(
        `INSERT INTO users (name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email::text AS email, phone`,
        [user.name, user.email, user.phone, user.passwordHash],
      );
      return rows[0]!;
    } catch (err) {
      if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) throw new EmailTakenError();
      throw err;
    }
  }
}
