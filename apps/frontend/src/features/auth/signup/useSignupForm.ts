import { useNavigate } from 'react-router-dom';
import { useAuthForm } from '../shared/useAuthForm';
import { useSafeNext } from '../shared/useSafeNext';
import { registerUser } from './signup.api';
import { EMPTY_SIGNUP_VALUES } from './signup.constants';
import { validateSignup } from './signup.validation';

/** Sign-up form state and submit flow (see useAuthForm); on success goes to the safe `?next=` path or home. */
export function useSignupForm() {
  const navigate = useNavigate();
  const next = useSafeNext();
  return useAuthForm({
    initialValues: EMPTY_SIGNUP_VALUES,
    validate: validateSignup,
    submit: registerUser,
    onSuccess: () => navigate(next, { replace: true }),
  });
}
