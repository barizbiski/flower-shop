import { Global, Module, type DynamicModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_CONFIG, type AppConfig } from './app.config.js';
import { AuthModule } from './features/auth/auth.module.js';
import { DatabaseModule } from './db/database.module.js';
import { HealthController } from './health.controller.js';
import { AllExceptionsFilter } from './http/errors.js';
import { OriginGuard } from './http/originCheck.js';

@Global()
@Module({})
export class AppModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [ScheduleModule.forRoot(), DatabaseModule, AuthModule],
      controllers: [HealthController],
      providers: [
        { provide: APP_CONFIG, useValue: config },
        { provide: APP_GUARD, useClass: OriginGuard },
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
      ],
      exports: [APP_CONFIG],
    };
  }
}
