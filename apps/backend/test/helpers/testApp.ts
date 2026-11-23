import { createApp } from '../../src/app.js';
import { runMigrations } from '../../src/db/migrate.js';
import { startPgliteServer } from '../../src/db/pglite-server.js';
import { createPool, type Db } from '../../src/db/pool.js';

export const WEB_ORIGIN = 'http://localhost:5173';

/** Boots an in-memory PGlite, migrates it, and returns the app's HTTP server wired to it. */
export async function startTestApp(opts: { secureCookies?: boolean } = {}) {
  const pglite = await startPgliteServer();
  await runMigrations(pglite.url, 'up', { quiet: true });
  const db: Db = createPool(pglite.url, 1);
  const nest = await createApp({ db, webOrigin: WEB_ORIGIN, secureCookies: opts.secureCookies ?? false });
  return {
    app: nest.getHttpServer(),
    db,
    async reset() {
      await db.query('TRUNCATE users CASCADE');
    },
    async stop() {
      await nest.close();
      await db.end();
      await pglite.stop();
    },
  };
}
