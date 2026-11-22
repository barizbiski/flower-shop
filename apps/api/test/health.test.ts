import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startTestApp } from './helpers/testApp.js';

describe('API skeleton', () => {
  let t: Awaited<ReturnType<typeof startTestApp>>;

  beforeAll(async () => {
    t = await startTestApp();
  });
  afterAll(async () => {
    await t.stop();
  });

  it('answers the health check', async () => {
    const res = await request(t.app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('returns the JSON error envelope for unknown API routes', async () => {
    const res = await request(t.app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Not found' } });
  });
});
