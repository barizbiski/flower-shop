import { startServer } from './bootstrap.js';

// Dev entry point: migrates the database at DATABASE_URL (the docker-compose Postgres) and starts the API.
await startServer({ migrate: true });
