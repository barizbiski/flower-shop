import { createApp } from './app.js';
import { loadConfig, requireConfig } from './config.js';
import { runMigrations } from './db/migrate.js';
import { createPool } from './db/pool.js';

// Dev entry point: migrates the database at DATABASE_URL (the docker-compose Postgres) and starts the API.
const config = loadConfig();
requireConfig(config);

await runMigrations(config.databaseUrl, 'up', { quiet: true });
const db = createPool(config.databaseUrl);
const app = await createApp({
  db,
  webOrigin: config.webOrigin,
  secureCookies: config.production,
  jwtAccessSecret: config.jwtAccessSecret,
});
await app.listen(config.port);
console.log(`API listening on http://localhost:${config.port}`);
