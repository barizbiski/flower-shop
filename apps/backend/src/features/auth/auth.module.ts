import { Module } from '@nestjs/common';
import { RegisterController } from './register/register.controller.js';
import { RegisterService } from './register/register.service.js';
import { SessionsRepository } from './shared/sessions.repo.js';
import { UsersRepository } from './shared/users.repo.js';

@Module({
  controllers: [RegisterController],
  providers: [RegisterService, UsersRepository, SessionsRepository],
})
export class AuthModule {}
