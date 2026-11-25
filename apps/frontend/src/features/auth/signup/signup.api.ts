import { AUTH_PATHS } from '@flower-shop/shared';
import { postCredentials } from '../shared/auth.api';
import { REGISTER_FAILURE_BY_STATUS } from './signup.constants';
import type { RegisterResult, SignupValues } from './signup.types';

export async function registerUser(values: SignupValues): Promise<RegisterResult> {
  const res = await postCredentials(AUTH_PATHS.register, values, 201);
  if (res.ok || res.kind === 'invalid') return res;
  return { ok: false, kind: REGISTER_FAILURE_BY_STATUS[res.status] ?? 'error' };
}
