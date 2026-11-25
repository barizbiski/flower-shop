import { AUTH_PATHS } from '@flower-shop/shared';
import { postCredentials } from '../shared/auth.api';
import { LOGIN_FAILURE_BY_STATUS } from './login.constants';
import type { LoginResult, LoginValues } from './login.types';

export async function loginUser(values: LoginValues): Promise<LoginResult> {
  const res = await postCredentials(AUTH_PATHS.login, values, 200);
  if (res.ok || res.kind === 'invalid') return res;
  return { ok: false, kind: LOGIN_FAILURE_BY_STATUS[res.status] ?? 'error' };
}
