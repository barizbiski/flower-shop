import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_CONFIG, type AppConfig } from '../../app.config.js';
import { LoginRateLimiter } from './login/login-rate-limiter.js';
import { LoginController } from './login/login.controller.js';
import { LoginService } from './login/login.service.js';
import { RegisterController } from './register/register.controller.js';
import { RegisterService } from './register/register.service.js';
import { AccessTokenService } from './shared/access-token.service.js';
import { ACCESS_TOKEN_ALGORITHM, ACCESS_TOKEN_TTL_S } from './shared/auth.constants.js';
import { JwtAuthGuard } from './shared/jwt-auth.guard.js';
import { SessionsRepository } from './shared/sessions.repo.js';
import { TokenIssuer } from './shared/token-issuer.service.js';
import { UsersRepository } from './shared/users.repo.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        secret: config.jwtAccessSecret,
        signOptions: { algorithm: ACCESS_TOKEN_ALGORITHM, expiresIn: ACCESS_TOKEN_TTL_S },
        verifyOptions: { algorithms: [ACCESS_TOKEN_ALGORITHM] },
      }),
    }),
  ],
  controllers: [RegisterController, LoginController],
  providers: [
    // shared
    UsersRepository,
    SessionsRepository,
    AccessTokenService,
    TokenIssuer,
    JwtAuthGuard,
    // register
    RegisterService,
    // login
    LoginService,
    LoginRateLimiter,
  ],
  // For other features' protected routes: @UseGuards(JwtAuthGuard) + @CurrentUserId().
  exports: [AccessTokenService, JwtAuthGuard],
})
export class AuthModule {}
