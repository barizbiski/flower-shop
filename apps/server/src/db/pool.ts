import pg from 'pg';

export type Db = pg.Pool;

export function createPool(connectionString: string, max = 10): Db {
  return new pg.Pool({ connectionString, max });
}
