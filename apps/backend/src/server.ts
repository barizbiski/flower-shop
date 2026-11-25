import { startServer } from './bootstrap.js';

// Production entry point (npm start): migrations run separately (npm run migrate).
await startServer();
