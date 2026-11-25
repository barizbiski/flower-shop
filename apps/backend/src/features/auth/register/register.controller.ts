import { Body, Controller, HttpCode, Inject, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ERROR_CODES } from '../../../common/constants/error-codes.js';
import { HttpError } from '../../../http/errors.js';
import type { AuthResponse } from '../shared/auth.types.js';
import { TokenIssuer } from '../shared/token-issuer.service.js';
import { REGISTER_MESSAGES } from './register.constants.js';
import { parseRegister } from './register.schema.js';
import { RegisterService } from './register.service.js';

@Controller('auth')
export class RegisterController {
  constructor(
    @Inject(RegisterService) private readonly registerService: RegisterService,
    @Inject(TokenIssuer) private readonly tokens: TokenIssuer,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: unknown, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const parsed = parseRegister(body);
    if (!parsed.ok) {
      throw new HttpError(400, ERROR_CODES.VALIDATION_ERROR, REGISTER_MESSAGES.formInvalid, parsed.fields);
    }
    return this.tokens.respond(res, await this.registerService.register(parsed.data));
  }
}
