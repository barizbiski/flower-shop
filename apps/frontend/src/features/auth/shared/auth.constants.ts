import { APP_ROUTES } from '../../../constants/routes';
import type { AuthSwitchTarget } from './auth.types';

/** Shown by the auth forms when a request fails unexpectedly (network error, 5xx). */
export const FORM_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/** Text and link of the prompt that switches between the login and sign-up pages. */
export const AUTH_SWITCH_PROMPTS: Record<AuthSwitchTarget, { question: string; label: string; to: string }> = {
  signup: { question: 'New here?', label: 'Create an account', to: APP_ROUTES.signup },
  login: { question: 'Already have an account?', label: 'Log in', to: APP_ROUTES.login },
};
