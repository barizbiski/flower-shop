import { createApp } from './app.js';
import { loadConfig, requireConfig } from './config.js';
import { createPool } from './db/pool.js';

const config = loadConfig();
requireConfig(config);

const db = createPool(config.databaseUrl);
const app = await createApp({
  db,
  webOrigin: config.webOrigin,
  secureCookies: config.production,
  jwtAccessSecret: config.jwtAccessSecret,
});
await app.listen(config.port);
console.log(`API listening on http://localhost:${config.port}`);
