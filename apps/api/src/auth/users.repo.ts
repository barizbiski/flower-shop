import type pg from 'pg';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export class EmailTakenError extends Error {}

export async function insertUser(
  client: pg.ClientBase,
  user: { name: string; email: string; phone: string; passwordHash: string },
): Promise<PublicUser> {
  try {
    const { rows } = await client.query<PublicUser>(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email::text AS email, phone`,
      [user.name, user.email, user.phone, user.passwordHash],
    );
    return rows[0]!;
  } catch (err) {
    if ((err as { code?: string; constraint?: string }).code === '23505') throw new EmailTakenError();
    throw err;
  }
}
