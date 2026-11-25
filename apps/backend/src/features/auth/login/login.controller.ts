import { AUTH_ENDPOINTS, AUTH_ROUTE, type AuthResponse, type PublicUser } from '@flower-shop/shared';
import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { APP_CONFIG, type AppConfig } from '../../../app.config.js';
import { HttpError } from '../../../common/http/errors.js';
import { parseBodyOrThrow } from '../../../common/validation/parse-body-or-throw.js';
import { CurrentUserId } from '../shared/current-user-id.decorator.js';
import { JwtAuthGuard } from '../shared/jwt-auth.guard.js';
import { clearAuthCookies } from '../shared/access-cookie.js';
import { TokenIssuer } from '../shared/token-issuer.service.js';
import { loginSchema } from './login.schema.js';
import { LoginService } from './login.service.js';

/** Login, token refresh, logout and the current user. Origin (CSRF) is checked globally by OriginGuard. */
@Controller(AUTH_ROUTE)
export class LoginController {
  constructor(
    @Inject(LoginService) private readonly loginService: LoginService,
    @Inject(TokenIssuer) private readonly tokens: TokenIssuer,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  @Post(AUTH_ENDPOINTS.login)
  @HttpCode(200)
  async login(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const input = parseBodyOrThrow(loginSchema, body);
    const session = await this.loginService.login(input, {
      ip: req.ip ?? '',
      currentSessionToken: await this.tokens.sessionTokenFrom(req),
    });
    return this.tokens.respond(res, session);
  }

  /** New access token for the session in the access cookie's `sub`; the cookie's JWT may have expired. */
  @Post(AUTH_ENDPOINTS.refresh)
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    try {
      const session = await this.loginService.refresh(await this.tokens.sessionTokenFrom(req));
      return await this.tokens.respond(res, session);
    } catch (err) {
      // A cookie whose session is dead is useless to the browser; drop it so it stops being sent.
      if (err instanceof HttpError && err.status === 401) clearAuthCookies(res, this.config.secureCookies);
      throw err;
    }
  }

  @Post(AUTH_ENDPOINTS.logout)
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.loginService.logout(await this.tokens.sessionTokenFrom(req));
    clearAuthCookies(res, this.config.secureCookies);
  }

  @Get(AUTH_ENDPOINTS.me)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUserId() userId: string): Promise<{ user: PublicUser }> {
    return { user: await this.loginService.me(userId) };
  }
}
