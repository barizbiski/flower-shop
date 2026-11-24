import { Inject, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { APP_CONFIG, type AppConfig } from '../app.config.js';
import { ERROR_CODES } from '../common/constants/error-codes.js';
import { SAFE_METHODS } from '../common/constants/http.js';
import { HttpError } from './errors.js';

/**
 * CSRF defence for cookie sessions (alongside SameSite=Lax): state-changing requests must
 * carry an Origin header equal to the web app's origin. Browsers always send Origin on
 * cross-site and same-origin POSTs, so a missing header is treated as foreign.
 */
@Injectable()
export class OriginGuard implements CanActivate {
  private readonly allowed: string;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.allowed = new URL(config.webOrigin).origin;
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(req.method)) return true;
    if (req.get('origin') === this.allowed) return true;
    throw new HttpError(403, ERROR_CODES.FORBIDDEN_ORIGIN, 'Request origin not allowed');
  }
}
