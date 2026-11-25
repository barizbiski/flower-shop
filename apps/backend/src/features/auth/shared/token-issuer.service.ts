import type { AuthResponse, PublicUser } from '@flower-shop/shared';
import { Inject, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { APP_CONFIG, type AppConfig } from '../../../app.config.js';
import { AccessTokenService } from './access-token.service.js';
import type { IssuedSession } from './auth.types.js';
import { setRefreshCookie } from './refresh-cookie.js';

/**
 * The one way register, login and refresh respond: the body is `{ accessToken, user }`. Only a
 * newly opened session (register, login) sets the refresh-token cookie; refresh never does.
 */
@Injectable()
export class TokenIssuer {
  constructor(
    @Inject(AccessTokenService) private readonly accessTokens: AccessTokenService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  /** Register / login: puts the new refresh token in the httpOnly cookie (never the body). */
  async respond(res: Response, { user, refreshToken }: IssuedSession): Promise<AuthResponse> {
    setRefreshCookie(res, refreshToken, this.config.secureCookies);
    return this.accessFor(user);
  }

  /** Refresh: a new access token only — the existing refresh token and cookie are left as they are. */
  async accessFor(user: PublicUser): Promise<AuthResponse> {
    return { accessToken: await this.accessTokens.sign(user.id), user };
  }
}
