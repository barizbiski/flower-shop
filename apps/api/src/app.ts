import cookieParser from 'cookie-parser';
import express from 'express';
import type { Db } from './db/pool.js';
import { errorHandler, HttpError } from './http/errors.js';

export interface AppConfig {
  db: Db;
  /** Origin of the web app, e.g. http://localhost:5173. */
  webOrigin: string;
  /** Set the Secure flag on cookies (production). */
  secureCookies: boolean;
}

export function createApp(_config: AppConfig) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'NOT_FOUND', 'Not found')));
  app.use(errorHandler);
  return app;
}
