import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { runMigrations } from './db/migrate.js';
import { startPgliteServer } from './db/pglite-server.js';
import { createPool } from './db/pool.js';

// Dev entry point: uses DATABASE_URL when set, otherwise a persistent PGlite database in apps/api/.pglite/.
const config = loadConfig();
let databaseUrl = config.databaseUrl;
let poolMax = 10;

if (!databaseUrl) {
  const dataDir = fileURLToPath(new URL('../.pglite', import.meta.url));
  const pglite = await startPgliteServer({ dataDir, port: config.pglitePort });
  databaseUrl = pglite.url;
  poolMax = 1;
  console.log(`Using PGlite dev database at ${dataDir}`);
  console.log(`Connect a DB viewer to ${pglite.url} (one connection at a time)`);
  const shutdown = () => void pglite.stop().finally(() => process.exit(0));
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

await runMigrations(databaseUrl, 'up', { quiet: true });
const db = createPool(databaseUrl, poolMax);
createApp({ db, webOrigin: config.webOrigin, secureCookies: config.production }).listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
