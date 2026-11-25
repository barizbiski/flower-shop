import { Inject, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '../../../common/constants/error-codes.js';
import { DatabaseService } from '../../../db/database.service.js';
import { HttpError } from '../../../http/errors.js';
import { AUTH_MESSAGES } from '../shared/auth.constants.js';
import type { IssuedSession, PublicUser } from '../shared/auth.types.js';
import { verifyPassword } from '../shared/helpers/password.js';
import { SessionsRepository } from '../shared/sessions.repo.js';
import { UsersRepository } from '../shared/users.repo.js';
import { LoginRateLimiter } from './login-rate-limiter.js';
import { DUMMY_PASSWORD_HASH, LOGIN_MESSAGES } from './login.constants.js';
import type { LoginContext, LoginInput } from './login.types.js';

const unauthenticated = () => new HttpError(401, ERROR_CODES.UNAUTHENTICATED, AUTH_MESSAGES.unauthenticated);

@Injectable()
export class LoginService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(UsersRepository) private readonly users: UsersRepository,
    @Inject(SessionsRepository) private readonly sessions: SessionsRepository,
    @Inject(LoginRateLimiter) private readonly limiter: LoginRateLimiter,
  ) {}

  /**
   * Checks the credentials and opens a new session. Unknown email and wrong password fail the
   * same way, in the same time (the dummy hash is verified when there's no user).
   */
  async login({ email, password }: LoginInput, { ip, currentRefreshToken }: LoginContext): Promise<IssuedSession> {
    const limitKey = LoginRateLimiter.key(ip, email);
    if (this.limiter.isBlocked(limitKey)) {
      throw new HttpError(429, ERROR_CODES.RATE_LIMITED, LOGIN_MESSAGES.rateLimited);
    }

    const found = await this.users.findByEmail(email);
    const passwordOk = await verifyPassword(found?.passwordHash ?? DUMMY_PASSWORD_HASH, password);
    if (!found || !passwordOk) {
      this.limiter.recordFailure(limitKey);
      throw new HttpError(401, ERROR_CODES.INVALID_CREDENTIALS, LOGIN_MESSAGES.invalidCredentials);
    }
    this.limiter.reset(limitKey);

    const { passwordHash: _omit, ...user } = found;
    const refreshToken = await this.db.transaction(async (client) => {
      if (currentRefreshToken) await this.sessions.deleteByToken(currentRefreshToken, client);
      return this.sessions.create(user.id, client);
    });
    return { user, refreshToken };
  }

  /** Swaps a live refresh token for a new one; 401 if it's missing, unknown, expired or already used. */
  async refresh(refreshToken: string | undefined): Promise<IssuedSession> {
    const rotated = refreshToken ? await this.sessions.rotate(refreshToken) : null;
    if (!rotated) throw unauthenticated();
    return rotated;
  }

  /** Ends the session behind a refresh token. Idempotent: no or an unknown token is fine. */
  async logout(refreshToken: string | undefined): Promise<void> {
    if (refreshToken) await this.sessions.deleteByToken(refreshToken);
  }

  /** The user behind a verified access token; 401 if the account no longer exists. */
  async me(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) throw unauthenticated();
    return user;
  }
}
