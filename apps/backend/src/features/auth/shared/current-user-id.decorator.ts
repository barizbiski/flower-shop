import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './auth.types.js';

/** The authenticated user's id, set by JwtAuthGuard. Only use on routes behind that guard. */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => ctx.switchToHttp().getRequest<AuthenticatedRequest>().userId,
);
