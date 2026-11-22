import type { User } from './AuthContext';
import type { SignupErrors, SignupValues } from './signup/validation';

export type RegisterResult =
  | { ok: true; user: User }
  | { ok: false; kind: 'email_taken' }
  | { ok: false; kind: 'invalid'; fields: SignupErrors }
  | { ok: false; kind: 'error' };

export async function registerUser(values: SignupValues): Promise<RegisterResult> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const body = await res.json().catch(() => null);
    if (res.status === 201 && body?.user) return { ok: true, user: body.user };
    if (res.status === 409) return { ok: false, kind: 'email_taken' };
    if (res.status === 400 && body?.error?.fields) return { ok: false, kind: 'invalid', fields: body.error.fields };
    return { ok: false, kind: 'error' };
  } catch {
    return { ok: false, kind: 'error' };
  }
}
