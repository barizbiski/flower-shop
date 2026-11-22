import { PGlite } from '@electric-sql/pglite';
import { citext } from '@electric-sql/pglite/contrib/citext';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

/**
 * Local Postgres without Docker: PGlite (Postgres compiled to WASM) served over the
 * Postgres wire protocol, so `pg` and node-pg-migrate connect to it like a real server.
 * PGlite handles one connection at a time — use a pool with max 1 against it.
 */
export async function startPgliteServer(opts: { dataDir?: string; port?: number } = {}) {
  const db = await PGlite.create({ dataDir: opts.dataDir, extensions: { citext } });
  const server = new PGLiteSocketServer({ db, port: opts.port ?? 0, host: '127.0.0.1' });
  await server.start();
  const address = server.getServerConn();
  return {
    url: `postgres://postgres:postgres@${address}/postgres`,
    async stop() {
      await server.stop();
      await db.close();
    },
  };
}
