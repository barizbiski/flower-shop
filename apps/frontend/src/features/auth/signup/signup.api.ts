import { API_ROUTES } from '../../../constants/api';
import { isApiError, postJson, setAccessToken } from '../../../lib/apiClient';
import { isTokenResponse } from '../shared/auth.api';
import type { AuthTokenResponse } from '../shared/auth.types';
import type { RegisterResult, SignupValues } from './signup.types';

export async function registerUser(values: SignupValues): Promise<RegisterResult> {
  try {
    const { status, body } = await postJson<AuthTokenResponse>(API_ROUTES.register, values);
    if (status === 201 && isTokenResponse(body)) {
      setAccessToken(body.accessToken);
      return { ok: true, user: body.user };
    }
    if (status === 409) return { ok: false, kind: 'email_taken' };
    if (status === 400 && isApiError(body) && body.error.fields) {
      return { ok: false, kind: 'invalid', fields: body.error.fields };
    }
    return { ok: false, kind: 'error' };
  } catch {
    return { ok: false, kind: 'error' };
  }
}
