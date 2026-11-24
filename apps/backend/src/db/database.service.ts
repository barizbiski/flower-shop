import { Inject, Injectable } from '@nestjs/common';
import type pg from 'pg';
import { APP_CONFIG, type AppConfig } from '../app.config.js';
import type { Db } from './pool.js';

/**
 * Nest-managed access to the Postgres pool. The pool itself is created and closed by the
 * entry point (server.ts / dev.ts / tests) and handed in through AppConfig.
 */
@Injectable()
export class DatabaseService {
  readonly pool: Db;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.pool = config.db;
  }

  /** Runs `fn` inside BEGIN/COMMIT on a dedicated client; rolls back and rethrows on error. */
  async transaction<T>(fn: (client: pg.ClientBase) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
