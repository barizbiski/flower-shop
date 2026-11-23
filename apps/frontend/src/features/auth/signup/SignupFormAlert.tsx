import { Alert } from '../../../components/ui/Alert';
import { TextLink } from '../../../components/ui/TextLink';
import type { SignupFormError } from './useSignupForm';

/** Banner for form-level failures; renders nothing when there is no error. */
export function SignupFormAlert({ error }: { error: SignupFormError }) {
  if (!error) return null;
  return (
    <Alert className="mb-4">
      {error === 'email_taken' ? (
        <>
          <span>An account with this email already exists</span> <TextLink to="/login">Log in instead</TextLink>
        </>
      ) : (
        <span>Something went wrong. Please try again.</span>
      )}
    </Alert>
  );
}
