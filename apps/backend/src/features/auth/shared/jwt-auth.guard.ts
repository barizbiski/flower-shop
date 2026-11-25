import { ERROR_CODES } from '@flower-shop/shared';
import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { HttpError } from '../../../common/http/errors.js';
import { AccessTokenService } from './access-token.service.js';
import { AUTH_MESSAGES } from './auth.constants.js';
import type { AuthenticatedRequest } from './auth.types.js';

const BEARER_RE = /^Bearer ([^\s]+)$/i;

/**
 * Protects a route with the access token: `Authorization: Bearer <jwt>`. On success the user id
 * is on `req.userId` (read it with `@CurrentUserId()`); otherwise 401 UNAUTHENTICATED.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AccessTokenService) private readonly accessTokens: AccessTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = BEARER_RE.exec(req.get('authorization') ?? '')?.[1];
    const userId = token ? await this.accessTokens.verify(token) : null;
    if (!userId) throw new HttpError(401, ERROR_CODES.UNAUTHENTICATED, AUTH_MESSAGES.unauthenticated);
    req.userId = userId;
    return true;
  }
}
