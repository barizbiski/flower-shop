import { useState, type FormEvent } from 'react';
import type { AuthFormState, FormErrors, UseAuthFormOptions } from './auth.types';
import { useAuth } from './useAuth';

/**
 * State and submit flow shared by the login and sign-up forms: validates on the client, submits,
 * stores the user in auth state and calls `onSuccess`; shows field errors inline and any other
 * failure as `formError`.
 */
export function useAuthForm<V extends object, F extends string>({
  initialValues,
  validate,
  submit,
  onSuccess,
}: UseAuthFormOptions<V, F>): AuthFormState<V, F> {
  const [values, setValues] = useState<V>(initialValues);
  const [errors, setErrors] = useState<FormErrors<V>>({});
  const [formError, setFormError] = useState<F | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useAuth();

  const update = (field: keyof V) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const clientErrors = validate(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSubmitting(true);
    const result = await submit(values);
    setSubmitting(false);

    if (result.ok) {
      setUser(result.user);
      onSuccess?.(result.user);
    } else if (result.kind === 'invalid') {
      setErrors((result as { fields: FormErrors<V> }).fields);
    } else {
      setFormError(result.kind as F);
    }
  }

  return { values, errors, formError, submitting, update, onSubmit };
}
