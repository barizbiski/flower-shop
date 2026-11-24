import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { SessionsRepository } from './sessions.repo.js';
import { UsersRepository } from './users.repo.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, SessionsRepository],
})
export class AuthModule {}
