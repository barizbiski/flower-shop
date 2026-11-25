import { ERROR_CODES, REGISTER_MESSAGES } from '@flower-shop/shared';
import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../db/database.service.js';
import { HttpError } from '../../../common/http/errors.js';
import type { IssuedSession } from '../shared/auth.types.js';
import { hashPassword } from '../shared/helpers/password.js';
import { SessionsRepository } from '../shared/sessions.repo.js';
import { EmailTakenError, UsersRepository } from '../shared/users.repo.js';
import type { RegisterInput } from './register.types.js';

@Injectable()
export class RegisterService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(UsersRepository) private readonly users: UsersRepository,
    @Inject(SessionsRepository) private readonly sessions: SessionsRepository,
  ) {}

  /** Creates the user and their first refresh session in one transaction. */
  async register({ name, email, phone, password }: RegisterInput): Promise<IssuedSession> {
    const passwordHash = await hashPassword(password);
    try {
      return await this.db.transaction(async (client) => {
        const user = await this.users.insert({ name, email, phone, passwordHash }, client);
        const sessionToken = await this.sessions.create(user.id, client);
        return { user, sessionToken };
      });
    } catch (err) {
      if (err instanceof EmailTakenError) {
        throw new HttpError(409, ERROR_CODES.EMAIL_TAKEN, REGISTER_MESSAGES.emailTaken);
      }
      throw err;
    }
  }
}
