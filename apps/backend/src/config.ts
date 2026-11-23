export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    databaseUrl: env.DATABASE_URL,
    webOrigin: env.WEB_ORIGIN ?? 'http://localhost:5173',
    port: Number(env.API_PORT ?? 3001),
    /** Port for the bundled PGlite dev database (avoids clashing with a real Postgres on 5432). */
    pglitePort: Number(env.PGLITE_PORT ?? 54320),
    production: env.NODE_ENV === 'production',
  };
}
