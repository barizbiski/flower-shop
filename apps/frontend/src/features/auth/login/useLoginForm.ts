import { useState, type FormEvent } from 'react';
import { loginUser } from './login.api';
import { EMPTY_LOGIN_VALUES } from './login.constants';
import type { LoginErrors, LoginField, LoginFormError, LoginValues, UseLoginFormOptions } from './login.types';
import { useAuth } from '../shared/useAuth';
import { validateLogin } from './login.validation';

/**
 * Login form state and submit flow: validates on the client, logs in, stores the user in auth
 * state, then calls `onSuccess`. Maps 401 and 429 to form-level messages.
 */
export function useLoginForm({ onSuccess }: UseLoginFormOptions = {}) {
  const [values, setValues] = useState<LoginValues>(EMPTY_LOGIN_VALUES);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<LoginFormError>(null);
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useAuth();

  /** Returns a change handler for one field; editing a field clears its error. */
  const update = (field: LoginField) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const clientErrors = validateLogin(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    const result = await loginUser(values);
    setSubmitting(false);

    if (result.ok) {
      setUser(result.user);
      onSuccess?.(result.user);
    } else if (result.kind === 'invalid') {
      setErrors(result.fields);
    } else {
      setFormError(result.kind);
    }
  }

  return { values, errors, formError, submitting, update, onSubmit };
}
