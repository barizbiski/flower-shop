import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { safeNext } from '../../../utils/safeNext';
import { registerUser } from '../api';
import { EMPTY_SIGNUP_VALUES } from '../constants';
import type { SignupErrors, SignupField, SignupFormError, SignupValues } from '../types';
import { useAuth } from '../useAuth';
import { validateSignup } from './validation';

/**
 * Sign-up form state and submit flow: validates on the client, registers, stores the
 * user in auth state, then redirects to the (sanitised) `?next=` path or home.
 */
export function useSignupForm() {
  const [values, setValues] = useState<SignupValues>(EMPTY_SIGNUP_VALUES);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [formError, setFormError] = useState<SignupFormError>(null);
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  /** Returns a change handler for one field; editing a field clears its error. */
  const update = (field: SignupField) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const clientErrors = validateSignup(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    const result = await registerUser(values);
    setSubmitting(false);

    if (result.ok) {
      setUser(result.user);
      navigate(safeNext(params.get('next')), { replace: true });
    } else if (result.kind === 'invalid') {
      setErrors(result.fields);
    } else {
      setFormError(result.kind);
    }
  }

  return { values, errors, formError, submitting, update, onSubmit };
}
