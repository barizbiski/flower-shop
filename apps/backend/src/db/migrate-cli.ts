import { runMigrations } from './migrate.js';

// Usage: npm run migrate -w apps/backend -- up|down   (requires DATABASE_URL; `npm run dev` also migrates on start)
const direction = process.argv[2] === 'down' ? 'down' : 'up';
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}
await runMigrations(url, direction);
