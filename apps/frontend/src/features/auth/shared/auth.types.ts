import type { FieldErrors, PublicUser } from '@flower-shop/shared';
import type { FormEvent, ReactNode } from 'react';

// PublicUser and AuthResponse (the API contract) live in @flower-shop/shared.

/** `loading` until the initial /refresh on mount settles; the header shows no account state until then. */
export type AuthStatus = 'loading' | 'ready';

export interface AuthState {
  user: PublicUser | null;
  status: AuthStatus;
  setUser: (user: PublicUser | null) => void;
  /** Ends the session on the server, drops the access token and shows the logged-out state. */
  logout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
  /** Seeds the state and skips the /refresh on mount (tests). Leave undefined in the app. */
  initialUser?: PublicUser | null;
}

/** Outcome of POSTing credentials (register or login), before mapping the status to a form error. */
export type CredentialsResponse =
  | { ok: true; user: PublicUser }
  | { ok: false; kind: 'invalid'; fields: FieldErrors }
  /** Any other outcome; `status` is 0 on a network failure. */
  | { ok: false; kind: 'status'; status: number };

/** Inline error per form field. */
export type FormErrors<V> = Partial<Record<keyof V, string>>;

/** Result of an auth form submit: success, field errors, or a form-level failure `F`. */
export type AuthFormResult<V, F extends string> =
  | { ok: true; user: PublicUser }
  | { ok: false; kind: 'invalid'; fields: FormErrors<V> }
  | { ok: false; kind: F };

export interface UseAuthFormOptions<V, F extends string> {
  initialValues: V;
  /** Client-side check; the form doesn't submit while it returns errors. */
  validate: (values: V) => FormErrors<V>;
  submit: (values: V) => Promise<AuthFormResult<V, F>>;
  /** Called after a successful submit, once the user is in auth state. */
  onSuccess?: (user: PublicUser) => void;
}

export interface AuthFormState<V, F extends string> {
  values: V;
  errors: FormErrors<V>;
  formError: F | null;
  submitting: boolean;
  /** Returns a change handler for one field; editing a field clears its error. */
  update: (field: keyof V) => (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

/** Which page an AuthSwitchPrompt links to. */
export type AuthSwitchTarget = 'login' | 'signup';

export interface AuthSwitchPromptProps {
  target: AuthSwitchTarget;
  /** Top border and spacing, for the footer of a page card. */
  divided?: boolean;
}

export interface AuthPageLayoutProps {
  title: string;
  intro: string;
  children: ReactNode;
  /** Prompt that links to the other auth page. */
  switchTo: AuthSwitchTarget;
}
