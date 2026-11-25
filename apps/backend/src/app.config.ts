import type { Db } from './db/pool.js';

export interface AppConfig {
  db: Db;
  /** Origin of the web app, e.g. http://localhost:5173. */
  webOrigin: string;
  /** Set the Secure flag on cookies (production). */
  secureCookies: boolean;
  /** HS256 secret for signing access tokens (JWT_ACCESS_SECRET). */
  jwtAccessSecret: string;
}

/** DI token for the AppConfig passed to AppModule.forRoot(). */
export const APP_CONFIG = Symbol('APP_CONFIG');
