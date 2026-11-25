import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { SessionCleanupService } from '../src/features/auth/shared/session-cleanup.service.js';
import { postAuth, registerUser, type TestApp } from './helpers/auth.js';
import { startTestApp } from './helpers/testApp.js';

async function sessionUserEmails(t: TestApp): Promise<string[]> {
  const { rows } = await t.db.query(
    'SELECT u.email::text AS email FROM sessions s JOIN users u ON u.id = s.user_id ORDER BY u.email',
  );
  return rows.map((r) => r.email);
}

describe('SessionCleanupService', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await startTestApp();
  });
  afterAll(async () => {
    await t.stop();
  });
  beforeEach(async () => {
    await t.reset();
  });

  it('deletes expired sessions and keeps valid ones', async () => {
    const live = await registerUser(t, { email: 'live@example.com' });
    await registerUser(t, { email: 'expired@example.com' });
    await t.db.query(
      `UPDATE sessions SET expires_at = now() - interval '1 second'
        WHERE user_id = (SELECT id FROM users WHERE email = 'expired@example.com')`,
    );

    const deleted = await t.nest.get(SessionCleanupService).deleteExpiredSessions();

    expect(deleted).toBe(1);
    expect(await sessionUserEmails(t)).toEqual(['live@example.com']);
    expect((await postAuth(t, 'refresh', undefined, { refreshToken: live.refreshToken })).status).toBe(200);
  });

  it('is a no-op when nothing has expired', async () => {
    await registerUser(t);
    expect(await t.nest.get(SessionCleanupService).deleteExpiredSessions()).toBe(0);
    expect(await sessionUserEmails(t)).toHaveLength(1);
  });
});
