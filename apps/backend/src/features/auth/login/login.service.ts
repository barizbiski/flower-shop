import { ERROR_CODES, LOGIN_MESSAGES, type PublicUser } from '@flower-shop/shared';
import { Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../db/database.service.js';
import { HttpError } from '../../../common/http/errors.js';
import { AUTH_MESSAGES } from '../shared/auth.constants.js';
import type { IssuedSession } from '../shared/auth.types.js';
import { verifyPassword } from '../shared/helpers/password.js';
import { SessionsRepository } from '../shared/sessions.repo.js';
import { UsersRepository } from '../shared/users.repo.js';
import { LoginRateLimiter } from './login-rate-limiter.js';
import { DUMMY_PASSWORD_HASH } from './login.constants.js';
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
  async login({ email, password }: LoginInput, { ip, currentSessionToken }: LoginContext): Promise<IssuedSession> {
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
    const sessionToken = await this.db.transaction(async (client) => {
      if (currentSessionToken) await this.sessions.revokeByToken(currentSessionToken, client);
      return this.sessions.create(user.id, client);
    });
    return { user, sessionToken };
  }

  /**
   * The session behind an access token's `sub`, for issuing a new access token; 401 if it's
   * missing, unknown, revoked or expired. No rotation: the session row stays unchanged.
   */
  async refresh(sessionToken: string | undefined): Promise<IssuedSession> {
    const user = sessionToken ? await this.sessions.findUserByToken(sessionToken) : null;
    if (!sessionToken || !user) throw unauthenticated();
    return { user, sessionToken };
  }

  /**
   * Revokes the session behind an access token's `sub` (the row is kept until it expires), so the
   * token can no longer be refreshed. Idempotent: no, an unknown or an already revoked token is fine.
   */
  async logout(sessionToken: string | undefined): Promise<void> {
    if (sessionToken) await this.sessions.revokeByToken(sessionToken);
  }

  /** The user behind a verified access token; 401 if the account no longer exists. */
  async me(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) throw unauthenticated();
    return user;
  }
}
