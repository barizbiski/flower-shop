import type { FormEvent } from 'react';
import type { AuthFormResult, FormErrors } from '../shared/auth.types';

export interface SignupValues {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export type SignupField = keyof SignupValues;
export type SignupErrors = FormErrors<SignupValues>;

/** Form-level sign-up failures, shown above the fields (field errors are shown inline). */
export type SignupFailure = 'email_taken' | 'error';

export type RegisterResult = AuthFormResult<SignupValues, SignupFailure>;

export interface SignupFormProps {
  values: SignupValues;
  errors: SignupErrors;
  submitting: boolean;
  onFieldChange: (field: SignupField) => (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export interface SignupFormAlertProps {
  error: SignupFailure | null;
}
