import { Alert } from '../../../components/ui/Alert/Alert';
import { TextLink } from '../../../components/ui/TextLink/TextLink';
import type { SignupFormAlertProps } from './signup.types';

/** Banner for form-level failures; renders nothing when there is no error. */
export function SignupFormAlert({ error }: SignupFormAlertProps) {
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
