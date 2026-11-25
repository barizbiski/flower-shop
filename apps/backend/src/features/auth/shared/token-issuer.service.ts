import type { AuthResponse } from '@flower-shop/shared';
import { Inject, Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { APP_CONFIG, type AppConfig } from '../../../app.config.js';
import { readAccessToken, setAccessCookie } from './access-cookie.js';
import { AccessTokenService } from './access-token.service.js';
import type { IssuedSession } from './auth.types.js';

/**
 * The one way register, login and refresh respond: a new access token for the session goes into
 * the httpOnly cookie, and the body is `{ user }`. The refresh session itself never leaves the DB.
 */
@Injectable()
export class TokenIssuer {
  constructor(
    @Inject(AccessTokenService) private readonly accessTokens: AccessTokenService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async respond(res: Response, { user, sessionToken }: IssuedSession): Promise<AuthResponse> {
    const accessToken = await this.accessTokens.sign({ sessionToken, userId: user.id });
    setAccessCookie(res, accessToken, this.config.secureCookies);
    return { user };
  }

  /**
   * The session token inside the request's access cookie, when it is signed with our secret —
   * expired or not. Undefined when there is no cookie or it is forged / malformed.
   */
  async sessionTokenFrom(req: Request): Promise<string | undefined> {
    const token = readAccessToken(req);
    if (!token) return undefined;
    return (await this.accessTokens.verifyIgnoringExpiry(token))?.sessionToken;
  }
}
