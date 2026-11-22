import cookieParser from 'cookie-parser';
import express from 'express';
import { authRoutes } from './auth/auth.routes.js';
import type { Db } from './db/pool.js';
import { errorHandler, HttpError } from './http/errors.js';
import { originCheck } from './http/originCheck.js';

export interface AppConfig {
  db: Db;
  /** Origin of the web app, e.g. http://localhost:5173. */
  webOrigin: string;
  /** Set the Secure flag on cookies (production). */
  secureCookies: boolean;
}

export function createApp(config: AppConfig) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());
  app.use('/api', originCheck(config.webOrigin));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/api/auth', authRoutes(config));

  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'NOT_FOUND', 'Not found')));
  app.use(errorHandler);
  return app;
}
