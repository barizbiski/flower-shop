import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createPool } from './db/pool.js';

const config = loadConfig();
if (!config.databaseUrl) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}

const db = createPool(config.databaseUrl);
const app = await createApp({ db, webOrigin: config.webOrigin, secureCookies: config.production });
await app.listen(config.port);
console.log(`API listening on http://localhost:${config.port}`);
