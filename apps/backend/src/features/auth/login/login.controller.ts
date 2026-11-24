import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { APP_CONFIG, type AppConfig } from '../../../app.config.js';
import { ERROR_CODES } from '../../../common/constants/error-codes.js';
import { HttpError } from '../../../http/errors.js';
import type { AuthResponse, PublicUser } from '../shared/auth.types.js';
import { CurrentUserId } from '../shared/current-user-id.decorator.js';
import { JwtAuthGuard } from '../shared/jwt-auth.guard.js';
import { clearRefreshCookie, readRefreshToken } from '../shared/refresh-cookie.js';
import { TokenIssuer } from '../shared/token-issuer.service.js';
import { LOGIN_MESSAGES } from './login.constants.js';
import { parseLogin } from './login.schema.js';
import { LoginService } from './login.service.js';

/** Login, token refresh, logout and the current user. Origin (CSRF) is checked globally by OriginGuard. */
@Controller('auth')
export class LoginController {
  constructor(
    @Inject(LoginService) private readonly loginService: LoginService,
    @Inject(TokenIssuer) private readonly tokens: TokenIssuer,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const parsed = parseLogin(body);
    if (!parsed.ok) {
      throw new HttpError(400, ERROR_CODES.VALIDATION_ERROR, LOGIN_MESSAGES.formInvalid, parsed.fields);
    }
    const session = await this.loginService.login(parsed.data, {
      ip: req.ip ?? '',
      currentRefreshToken: readRefreshToken(req),
    });
    return this.tokens.respond(res, session);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    try {
      return await this.tokens.respond(res, await this.loginService.refresh(readRefreshToken(req)));
    } catch (err) {
      // A dead refresh token is useless to the browser; drop it so it stops being sent.
      if (err instanceof HttpError && err.status === 401) clearRefreshCookie(res, this.config.secureCookies);
      throw err;
    }
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.loginService.logout(readRefreshToken(req));
    clearRefreshCookie(res, this.config.secureCookies);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUserId() userId: string): Promise<{ user: PublicUser }> {
    return { user: await this.loginService.me(userId) };
  }
}
