import { Button } from '../../../components/ui/Button/Button';
import { TextField } from '../../../components/ui/TextField/TextField';
import type { SignupFormProps } from './signup.types';

/** The sign-up fields and submit button. Presentation only; state lives in useSignupForm. */
export function SignupForm({ values, errors, submitting, onFieldChange, onSubmit }: SignupFormProps) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
      <TextField
        id="name"
        label="Full name"
        value={values.name}
        onChange={onFieldChange('name')}
        error={errors.name}
        autoComplete="name"
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        value={values.email}
        onChange={onFieldChange('email')}
        error={errors.email}
        autoComplete="email"
        placeholder="you@example.com"
      />
      <TextField
        id="phone"
        label="Phone"
        type="tel"
        value={values.phone}
        onChange={onFieldChange('phone')}
        error={errors.phone}
        autoComplete="tel"
        placeholder="050-123-4567"
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        value={values.password}
        onChange={onFieldChange('password')}
        error={errors.password}
        autoComplete="new-password"
        hint="At least 8 characters"
      />

      <Button type="submit" loading={submitting} loadingText="Creating account…" className="mt-2">
        Create account
      </Button>
    </form>
  );
}
