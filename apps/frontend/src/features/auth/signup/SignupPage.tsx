import { AuthPageLayout } from '../shared/AuthPageLayout';
import { SignupForm } from './SignupForm';
import { SignupFormAlert } from './SignupFormAlert';
import { useSignupForm } from './useSignupForm';

export function SignupPage() {
  const { values, errors, formError, submitting, update, onSubmit } = useSignupForm();

  return (
    <AuthPageLayout
      title="Create your account"
      intro="Sign up to check out and keep your details ready for next time."
      switchTo="login"
    >
      <SignupFormAlert error={formError} />
      <SignupForm values={values} errors={errors} submitting={submitting} onFieldChange={update} onSubmit={onSubmit} />
    </AuthPageLayout>
  );
}
