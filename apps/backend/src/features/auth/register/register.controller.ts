import { AUTH_ENDPOINTS, AUTH_ROUTE, type AuthResponse } from '@flower-shop/shared';
import { Body, Controller, HttpCode, Inject, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { parseBodyOrThrow } from '../../../common/validation/parse-body-or-throw.js';
import { TokenIssuer } from '../shared/token-issuer.service.js';
import { registerSchema } from './register.schema.js';
import { RegisterService } from './register.service.js';

@Controller(AUTH_ROUTE)
export class RegisterController {
  constructor(
    @Inject(RegisterService) private readonly registerService: RegisterService,
    @Inject(TokenIssuer) private readonly tokens: TokenIssuer,
  ) {}

  @Post(AUTH_ENDPOINTS.register)
  @HttpCode(201)
  async register(@Body() body: unknown, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const input = parseBodyOrThrow(registerSchema, body);
    return this.tokens.respond(res, await this.registerService.register(input));
  }
}
