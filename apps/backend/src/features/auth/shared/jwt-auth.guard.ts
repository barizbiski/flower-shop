import { ERROR_CODES } from '@flower-shop/shared';
import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { HttpError } from '../../../common/http/errors.js';
import { readAccessToken } from './access-cookie.js';
import { AccessTokenService } from './access-token.service.js';
import { AUTH_MESSAGES } from './auth.constants.js';
import type { AuthenticatedRequest } from './auth.types.js';

/**
 * Protects a route with the access token from the httpOnly `access_token` cookie. Checks only the
 * JWT's signature and expiry (no DB lookup), so a token stays usable until it expires even after
 * logout. On success the user id is on `req.userId` (read it with `@CurrentUserId()`); otherwise
 * 401 UNAUTHENTICATED.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AccessTokenService) private readonly accessTokens: AccessTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = readAccessToken(req);
    const claims = token ? await this.accessTokens.verify(token) : null;
    if (!claims) throw new HttpError(401, ERROR_CODES.UNAUTHENTICATED, AUTH_MESSAGES.unauthenticated);
    req.userId = claims.userId;
    return true;
  }
}
