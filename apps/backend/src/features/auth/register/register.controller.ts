import { Body, Controller, HttpCode, Inject, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { APP_CONFIG, type AppConfig } from '../../../app.config.js';
import { ERROR_CODES } from '../../../common/constants/error-codes.js';
import { HttpError } from '../../../http/errors.js';
import { setSessionCookie } from '../shared/session-cookie.js';
import { REGISTER_MESSAGES } from './register.constants.js';
import { parseRegister } from './register.schema.js';
import { RegisterService } from './register.service.js';

@Controller('auth')
export class RegisterController {
  constructor(
    @Inject(RegisterService) private readonly registerService: RegisterService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const parsed = parseRegister(body);
    if (!parsed.ok) {
      throw new HttpError(400, ERROR_CODES.VALIDATION_ERROR, REGISTER_MESSAGES.formInvalid, parsed.fields);
    }
    const { user, token } = await this.registerService.register(parsed.data);
    setSessionCookie(res, token, this.config.secureCookies);
    return { user };
  }
}
