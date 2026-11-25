import { API_ROUTES } from '../../../constants/api';
import { isApiError, postJson, setAccessToken } from '../../../lib/apiClient';
import { isTokenResponse } from '../shared/auth.api';
import type { AuthTokenResponse } from '../shared/auth.types';
import type { LoginResult, LoginValues } from './login.types';

export async function loginUser(values: LoginValues): Promise<LoginResult> {
  try {
    const { status, body } = await postJson<AuthTokenResponse>(API_ROUTES.login, values);
    if (status === 200 && isTokenResponse(body)) {
      setAccessToken(body.accessToken);
      return { ok: true, user: body.user };
    }
    if (status === 401) return { ok: false, kind: 'invalid_credentials' };
    if (status === 429) return { ok: false, kind: 'rate_limited' };
    if (status === 400 && isApiError(body) && body.error.fields) {
      return { ok: false, kind: 'invalid', fields: body.error.fields };
    }
    return { ok: false, kind: 'error' };
  } catch {
    return { ok: false, kind: 'error' };
  }
}
