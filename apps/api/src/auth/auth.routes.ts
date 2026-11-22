import { Router, type NextFunction, type Request, type Response } from 'express';
import type { AppConfig } from '../app.js';
import { HttpError } from '../http/errors.js';
import { hashPassword } from './password.js';
import { parseRegister } from './register.schema.js';
import { createSession, setSessionCookie } from './sessions.js';
import { EmailTakenError, insertUser } from './users.repo.js';

export function authRoutes({ db, secureCookies }: AppConfig) {
  const router = Router();

  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = parseRegister(req.body);
      if (!parsed.ok) {
        throw new HttpError(400, 'VALIDATION_ERROR', 'Please fix the highlighted fields', parsed.fields);
      }
      const { name, email, phone, password } = parsed.data;
      const passwordHash = await hashPassword(password);

      const client = await db.connect();
      let user;
      let token;
      try {
        await client.query('BEGIN');
        user = await insertUser(client, { name, email, phone, passwordHash });
        token = await createSession(client, user.id);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      setSessionCookie(res, token, secureCookies);
      res.status(201).json({ user });
    } catch (err) {
      if (err instanceof EmailTakenError) {
        next(new HttpError(409, 'EMAIL_TAKEN', 'An account with this email already exists'));
        return;
      }
      next(err);
    }
  });

  return router;
}
