import { Alert } from '../../../components/ui/Alert/Alert';
import { Button } from '../../../components/ui/Button/Button';
import { TextField } from '../../../components/ui/TextField/TextField';
import { LOGIN_FORM_MESSAGES } from './login.constants';
import type { LoginFormProps } from './login.types';
import { useLoginForm } from './useLoginForm';

/** Email + password login form, shared by the header account panel and the /login page. */
export function LoginForm({ idPrefix, onSuccess }: LoginFormProps) {
  const { values, errors, formError, submitting, update, onSubmit } = useLoginForm({ onSuccess });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      {formError && <Alert>{LOGIN_FORM_MESSAGES[formError]}</Alert>}
      <TextField
        id={`${idPrefix}-email`}
        label="Email"
        type="email"
        value={values.email}
        onChange={update('email')}
        error={errors.email}
        autoComplete="email"
        placeholder="you@example.com"
      />
      <TextField
        id={`${idPrefix}-password`}
        label="Password"
        type="password"
        value={values.password}
        onChange={update('password')}
        error={errors.password}
        autoComplete="current-password"
      />
      <Button type="submit" loading={submitting} loadingText="Logging in…" className="mt-2">
        Log in
      </Button>
    </form>
  );
}
