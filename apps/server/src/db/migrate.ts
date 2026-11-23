import { fileURLToPath } from 'node:url';
import { runner } from 'node-pg-migrate';

const MIGRATIONS_DIR = fileURLToPath(new URL('./migrations', import.meta.url));

export async function runMigrations(
  databaseUrl: string,
  direction: 'up' | 'down' = 'up',
  opts: { count?: number; quiet?: boolean } = {},
): Promise<void> {
  await runner({
    databaseUrl,
    dir: MIGRATIONS_DIR,
    direction,
    count: opts.count ?? (direction === 'up' ? Infinity : 1),
    migrationsTable: 'pgmigrations',
    // PGlite serialises connections itself; advisory locks are unnecessary there and harmless elsewhere.
    noLock: true,
    log: opts.quiet ? () => {} : console.log,
  });
}
