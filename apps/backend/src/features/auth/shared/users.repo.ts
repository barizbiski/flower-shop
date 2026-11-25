import type { PublicUser } from '@flower-shop/shared';
import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../db/database.service.js';
import type { Queryable } from '../../../db/pool.js';
import { PG_UNIQUE_VIOLATION } from './auth.constants.js';
import type { NewUser, UserWithPasswordHash } from './auth.types.js';

export class EmailTakenError extends Error {}

/** Columns of a PublicUser; `email` is citext in the DB, cast so pg returns a plain string. */
const PUBLIC_COLUMNS = 'id, name, email::text AS email, phone';

@Injectable()
export class UsersRepository {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  /** Inserts a user; pass a transaction client as `q` to run inside a transaction. */
  async insert(user: NewUser, q: Queryable = this.db.pool): Promise<PublicUser> {
    try {
      const { rows } = await q.query<PublicUser>(
        `INSERT INTO users (name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING ${PUBLIC_COLUMNS}`,
        [user.name, user.email, user.phone, user.passwordHash],
      );
      return rows[0]!;
    } catch (err) {
      if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) throw new EmailTakenError();
      throw err;
    }
  }

  /** Finds a user by email (case-insensitive, citext) including the password hash, for login. */
  async findByEmail(email: string, q: Queryable = this.db.pool): Promise<UserWithPasswordHash | null> {
    const { rows } = await q.query<UserWithPasswordHash>(
      `SELECT ${PUBLIC_COLUMNS}, password_hash AS "passwordHash" FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findById(id: string, q: Queryable = this.db.pool): Promise<PublicUser | null> {
    const { rows } = await q.query<PublicUser>(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
    return rows[0] ?? null;
  }
}
