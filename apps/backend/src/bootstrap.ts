import { createApp } from './app.js';
import { loadConfig, requireConfig } from './config.js';
import { runMigrations } from './db/migrate.js';
import { createPool } from './db/pool.js';

/**
 * Loads the config from the environment, optionally migrates the database, and starts the API.
 * Shared by the production entry (server.ts) and the dev entry (dev.ts).
 */
export async function startServer({ migrate = false }: { migrate?: boolean } = {}): Promise<void> {
  const config = loadConfig();
  requireConfig(config);

  if (migrate) await runMigrations(config.databaseUrl, 'up', { quiet: true });
  const db = createPool(config.databaseUrl);
  const app = await createApp({
    db,
    webOrigin: config.webOrigin,
    secureCookies: config.production,
    jwtAccessSecret: config.jwtAccessSecret,
  });
  await app.listen(config.port);
  console.log(`API listening on http://localhost:${config.port}`);
}
