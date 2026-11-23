import { Body, Controller, HttpCode, Inject, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { APP_CONFIG, type AppConfig } from '../app.config.js';
import { HttpError } from '../http/errors.js';
import { AuthService } from './auth.service.js';
import { parseRegister } from './register.schema.js';
import { setSessionCookie } from './sessions.js';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const parsed = parseRegister(body);
    if (!parsed.ok) {
      throw new HttpError(400, 'VALIDATION_ERROR', 'Please fix the highlighted fields', parsed.fields);
    }
    const { user, token } = await this.auth.register(parsed.data);
    setSessionCookie(res, token, this.config.secureCookies);
    return { user };
  }
}
