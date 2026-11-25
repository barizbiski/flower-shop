import type { PublicUser } from '@flower-shop/shared';
import { useAuthForm } from '../shared/useAuthForm';
import { loginUser } from './login.api';
import { EMPTY_LOGIN_VALUES } from './login.constants';
import { validateLogin } from './login.validation';

/** Login form state and submit flow (see useAuthForm). */
export function useLoginForm(onSuccess?: (user: PublicUser) => void) {
  return useAuthForm({ initialValues: EMPTY_LOGIN_VALUES, validate: validateLogin, submit: loginUser, onSuccess });
}
