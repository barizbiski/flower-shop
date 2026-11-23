import { Card } from '../../../components/ui/Card';
import { Heading } from '../../../components/ui/Heading';
import { TextLink } from '../../../components/ui/TextLink';
import { SignupForm } from './SignupForm';
import { SignupFormAlert } from './SignupFormAlert';
import { useSignupForm } from './useSignupForm';

export function SignupPage() {
  const { values, errors, formError, submitting, update, onSubmit } = useSignupForm();

  return (
    <main className="flex justify-center px-4 py-12 sm:py-20">
      <Card className="w-full max-w-md">
        <Heading>Create your account</Heading>
        <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">
          Sign up to check out and keep your details ready for next time.
        </p>

        <SignupFormAlert error={formError} />
        <SignupForm values={values} errors={errors} submitting={submitting} onFieldChange={update} onSubmit={onSubmit} />

        <p className="mt-5 mb-0 flex justify-center gap-1.5 border-t border-line-soft pt-4 text-sm text-muted">
          Already have an account?
          <TextLink to="/login" emphasis>
            Log in
          </TextLink>
        </p>
      </Card>
    </main>
  );
}
