import { useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { safeNext } from '../../../lib/safeNext';
import { registerUser } from '../api';
import { useAuth } from '../AuthContext';
import { validateSignup, type SignupErrors, type SignupField, type SignupValues } from './validation';

type FormError = 'email_taken' | 'error' | null;

const EMPTY: SignupValues = { name: '', email: '', phone: '', password: '' };

export function SignupPage() {
  const [values, setValues] = useState<SignupValues>(EMPTY);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [formError, setFormError] = useState<FormError>(null);
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

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

  return (
    <main className="flex justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-md rounded-3xl border border-line-soft bg-white p-6 shadow-sm sm:p-8">
        <h1 className="m-0 font-display text-4xl font-normal leading-tight">Create your account</h1>
        <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">
          Sign up to check out and keep your details ready for next time.
        </p>

        {formError && (
          <div role="alert" className="mb-4 rounded-2xl bg-blush px-4 py-3 text-sm font-semibold text-error">
            {formError === 'email_taken' ? (
              <>
                <span>An account with this email already exists</span>{' '}
                <Link to="/login" className="text-wine underline">
                  Log in instead
                </Link>
              </>
            ) : (
              <span>Something went wrong. Please try again.</span>
            )}
          </div>
        )}

        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-3">
          <Field id="name" label="Full name" value={values.name} onChange={update('name')} error={errors.name} autoComplete="name" />
          <Field
            id="email"
            label="Email"
            type="email"
            value={values.email}
            onChange={update('email')}
            error={errors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Field
            id="phone"
            label="Phone"
            type="tel"
            value={values.phone}
            onChange={update('phone')}
            error={errors.phone}
            autoComplete="tel"
            placeholder="050-123-4567"
          />
          <Field
            id="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={update('password')}
            error={errors.password}
            autoComplete="new-password"
            hint="At least 8 characters"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 h-12 cursor-pointer rounded-full border-0 bg-wine font-sans text-[15px] font-semibold text-white hover:bg-wine-dark disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 mb-0 flex justify-center gap-1.5 border-t border-line-soft pt-4 text-sm text-muted">
          Already have an account?
          <Link to="/login" className="font-bold text-wine underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'id'> {
  id: SignupField;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
}

function Field({ id, label, value, onChange, error, hint, ...rest }: FieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`h-[46px] w-full rounded-[14px] border-[1.5px] bg-white px-3.5 font-sans text-[15px] text-ink outline-offset-1 focus:border-wine focus:outline-2 focus:outline-wine ${
          error ? 'border-error' : 'border-line'
        }`}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="m-0 text-[13px] font-semibold text-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="m-0 text-[13px] text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
