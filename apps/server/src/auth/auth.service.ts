import { Inject, Injectable } from '@nestjs/common';
import { APP_CONFIG, type AppConfig } from '../app.config.js';
import { HttpError } from '../http/errors.js';
import { hashPassword } from './password.js';
import type { RegisterInput } from './register.schema.js';
import { createSession } from './sessions.js';
import { EmailTakenError, insertUser, type PublicUser } from './users.repo.js';

@Injectable()
export class AuthService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  /** Creates the user and their first session in one transaction; returns the raw session token. */
  async register({ name, email, phone, password }: RegisterInput): Promise<{ user: PublicUser; token: string }> {
    const passwordHash = await hashPassword(password);
    const client = await this.config.db.connect();
    try {
      await client.query('BEGIN');
      const user = await insertUser(client, { name, email, phone, passwordHash });
      const token = await createSession(client, user.id);
      await client.query('COMMIT');
      return { user, token };
    } catch (err) {
      await client.query('ROLLBACK');
      if (err instanceof EmailTakenError) {
        throw new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
      }
      throw err;
    } finally {
      client.release();
    }
  }
}
