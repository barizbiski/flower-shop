import { Inject, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { APP_CONFIG, type AppConfig } from '../../../app.config.js';
import { AccessTokenService } from './access-token.service.js';
import type { AuthResponse, IssuedSession } from './auth.types.js';
import { setRefreshCookie } from './refresh-cookie.js';

/**
 * The one way register, login and refresh respond: the new refresh token goes into the httpOnly
 * cookie (never the body), and the body is `{ accessToken, user }`.
 */
@Injectable()
export class TokenIssuer {
  constructor(
    @Inject(AccessTokenService) private readonly accessTokens: AccessTokenService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async respond(res: Response, { user, refreshToken }: IssuedSession): Promise<AuthResponse> {
    setRefreshCookie(res, refreshToken, this.config.secureCookies);
    return { accessToken: await this.accessTokens.sign(user.id), user };
  }
}
