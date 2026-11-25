export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    databaseUrl: env.DATABASE_URL,
    webOrigin: env.WEB_ORIGIN ?? 'http://localhost:5173',
    port: Number(env.API_PORT ?? 3001),
    production: env.NODE_ENV === 'production',
  };
}
