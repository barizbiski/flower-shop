import pg from 'pg';

export type Db = pg.Pool;

/** Anything a repository can run a query on: the pool, or a client checked out for a transaction. */
export type Queryable = pg.Pool | pg.ClientBase;

export function createPool(connectionString: string, max = 10): Db {
  return new pg.Pool({ connectionString, max });
}
