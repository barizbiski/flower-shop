import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import type { AppConfig } from './app.config.js';
import { AppModule } from './app.module.js';
import { API_PREFIX, JSON_BODY_LIMIT } from './common/constants/http.js';

export type { AppConfig } from './app.config.js';

/** Builds and initialises the Nest app (not yet listening). */
export async function createApp(config: AppConfig): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule.forRoot(config), {
    logger: ['error', 'warn'],
  });
  app.disable('x-powered-by');
  app.useBodyParser('json', { limit: JSON_BODY_LIMIT });
  app.use(cookieParser());
  app.setGlobalPrefix(API_PREFIX);
  await app.init();
  return app;
}
