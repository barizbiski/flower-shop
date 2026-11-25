import type { FormEvent } from 'react';
import type { User } from '../shared/auth.types';

export interface SignupValues {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export type SignupField = keyof SignupValues;
export type SignupErrors = Partial<Record<SignupField, string>>;

/** Form-level failure shown above the fields (field errors are shown inline). */
export type SignupFormError = 'email_taken' | 'error' | null;

export type RegisterResult =
  | { ok: true; user: User }
  | { ok: false; kind: 'email_taken' }
  | { ok: false; kind: 'invalid'; fields: SignupErrors }
  | { ok: false; kind: 'error' };

export interface SignupFormProps {
  values: SignupValues;
  errors: SignupErrors;
  submitting: boolean;
  onFieldChange: (field: SignupField) => (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export interface SignupFormAlertProps {
  error: SignupFormError;
}
