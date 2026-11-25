import { REGISTER_MESSAGES } from '@flower-shop/shared';
import { Alert } from '../../../components/ui/Alert/Alert';
import { TextLink } from '../../../components/ui/TextLink/TextLink';
import { APP_ROUTES } from '../../../constants/routes';
import { FORM_ERROR_MESSAGE } from '../shared/auth.constants';
import type { SignupFormAlertProps } from './signup.types';

/** Banner for form-level failures; renders nothing when there is no error. */
export function SignupFormAlert({ error }: SignupFormAlertProps) {
  if (!error) return null;
  return (
    <Alert className="mb-4">
      {error === 'email_taken' ? (
        <>
          <span>{REGISTER_MESSAGES.emailTaken}</span> <TextLink to={APP_ROUTES.login}>Log in instead</TextLink>
        </>
      ) : (
        <span>{FORM_ERROR_MESSAGE}</span>
      )}
    </Alert>
  );
}
