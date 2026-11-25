/** Shortest JWT_ACCESS_SECRET the server accepts (HS256 wants at least 256 bits of key). */
export const JWT_SECRET_MIN_LENGTH = 32;

export function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    databaseUrl: env.DATABASE_URL,
    jwtAccessSecret: env.JWT_ACCESS_SECRET,
    webOrigin: env.WEB_ORIGIN ?? 'http://localhost:5173',
    port: Number(env.API_PORT ?? 3001),
    production: env.NODE_ENV === 'production',
  };
}

export type LoadedConfig = ReturnType<typeof loadConfig>;

/** Exits the process with a message when a required env var is missing; otherwise narrows the type. */
export function requireConfig(config: LoadedConfig): asserts config is LoadedConfig & {
  databaseUrl: string;
  jwtAccessSecret: string;
} {
  if (!config.databaseUrl) {
    console.error(
      'DATABASE_URL is required. Run `docker compose up -d` and set it in apps/backend/.env (see .env.example).',
    );
    process.exit(1);
  }
  if (!config.jwtAccessSecret || config.jwtAccessSecret.length < JWT_SECRET_MIN_LENGTH) {
    console.error(
      `JWT_ACCESS_SECRET is required (at least ${JWT_SECRET_MIN_LENGTH} characters). ` +
        'Set it in apps/backend/.env (see .env.example).',
    );
    process.exit(1);
  }
}
