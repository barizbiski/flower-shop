import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { runMigrations } from './db/migrate.js';
import { createPool } from './db/pool.js';

// Dev entry point: migrates the database at DATABASE_URL (the docker-compose Postgres) and starts the API.
const config = loadConfig();
if (!config.databaseUrl) {
  console.error('DATABASE_URL is required. Run `docker compose up -d` and set it in apps/backend/.env (see .env.example).');
  process.exit(1);
}

await runMigrations(config.databaseUrl, 'up', { quiet: true });
const db = createPool(config.databaseUrl);
const app = await createApp({ db, webOrigin: config.webOrigin, secureCookies: config.production });
await app.listen(config.port);
console.log(`API listening on http://localhost:${config.port}`);
