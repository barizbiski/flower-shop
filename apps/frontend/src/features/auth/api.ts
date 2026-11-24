import { API_ROUTES } from '../../constants/api';
import { isApiError, postJson } from '../../lib/apiClient';
import type { RegisterResult, SignupValues, User } from './types';

export async function registerUser(values: SignupValues): Promise<RegisterResult> {
  try {
    const { status, body } = await postJson<{ user: User }>(API_ROUTES.register, values);
    if (status === 201 && body && 'user' in body) return { ok: true, user: body.user };
    if (status === 409) return { ok: false, kind: 'email_taken' };
    if (status === 400 && isApiError(body) && body.error.fields) {
      return { ok: false, kind: 'invalid', fields: body.error.fields };
    }
    return { ok: false, kind: 'error' };
  } catch {
    return { ok: false, kind: 'error' };
  }
}
