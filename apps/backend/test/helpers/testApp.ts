import { randomBytes } from 'node:crypto';
import pg from 'pg';
import { createApp } from '../../src/app.js';
import { runMigrations } from '../../src/db/migrate.js';
import { createPool, type Db } from '../../src/db/pool.js';

export const WEB_ORIGIN = 'http://localhost:5173';
/** Throwaway JWT signing secret, generated per test run. */
export const TEST_JWT_SECRET = randomBytes(32).toString('hex');

/** Server to create throwaway test databases on: TEST_DATABASE_URL, else DATABASE_URL (the docker-compose Postgres). */
function adminUrl(): string {
  const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error('Tests need Postgres: run `docker compose up -d` and set DATABASE_URL in apps/backend/.env.');
  }
  return url;
}

async function adminQuery(sql: string) {
  const client = new pg.Client({ connectionString: adminUrl() });
  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}

/** Creates a fresh, migrated database for one test file and returns the app's HTTP server wired to it. */
export async function startTestApp(opts: { secureCookies?: boolean } = {}) {
  const dbName = `flower_test_${randomBytes(6).toString('hex')}`;
  await adminQuery(`CREATE DATABASE ${dbName}`);
  const url = new URL(adminUrl());
  url.pathname = `/${dbName}`;

  await runMigrations(url.toString(), 'up', { quiet: true });
  const db: Db = createPool(url.toString());
  const nest = await createApp({
    db,
    webOrigin: WEB_ORIGIN,
    secureCookies: opts.secureCookies ?? false,
    jwtAccessSecret: TEST_JWT_SECRET,
  });
  return {
    app: nest.getHttpServer(),
    /** The Nest app, for reaching providers directly (e.g. to run a scheduled job on demand). */
    nest,
    db,
    async reset() {
      await db.query('TRUNCATE users CASCADE');
    },
    async stop() {
      await nest.close();
      await db.end();
      await adminQuery(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
    },
  };
}
