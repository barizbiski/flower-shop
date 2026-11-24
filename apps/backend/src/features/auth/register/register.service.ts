import { Inject, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '../../../common/constants/error-codes.js';
import { DatabaseService } from '../../../db/database.service.js';
import { HttpError } from '../../../http/errors.js';
import { hashPassword } from '../shared/helpers/password.js';
import { SessionsRepository } from '../shared/sessions.repo.js';
import { EmailTakenError, UsersRepository } from '../shared/users.repo.js';
import { REGISTER_MESSAGES } from './register.constants.js';
import type { RegisterInput, RegisterResult } from './register.types.js';

@Injectable()
export class RegisterService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(UsersRepository) private readonly users: UsersRepository,
    @Inject(SessionsRepository) private readonly sessions: SessionsRepository,
  ) {}

  /** Creates the user and their first session in one transaction; returns the raw session token. */
  async register({ name, email, phone, password }: RegisterInput): Promise<RegisterResult> {
    const passwordHash = await hashPassword(password);
    try {
      return await this.db.transaction(async (client) => {
        const user = await this.users.insert({ name, email, phone, passwordHash }, client);
        const token = await this.sessions.create(user.id, client);
        return { user, token };
      });
    } catch (err) {
      if (err instanceof EmailTakenError) {
        throw new HttpError(409, ERROR_CODES.EMAIL_TAKEN, REGISTER_MESSAGES.emailTaken);
      }
      throw err;
    }
  }
}
