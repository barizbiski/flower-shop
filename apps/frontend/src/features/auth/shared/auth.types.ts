import type { ReactNode } from 'react';

/** Public user profile, as returned by the auth endpoints. */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/** `loading` until the initial /refresh on mount settles; the header shows no account state until then. */
export type AuthStatus = 'loading' | 'ready';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User | null) => void;
  /** Ends the session on the server, drops the access token and shows the logged-out state. */
  logout: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
  /** Seeds the state and skips the /refresh on mount (tests). Leave undefined in the app. */
  initialUser?: User | null;
}

/** Body of a successful register, login or refresh. */
export interface AuthTokenResponse {
  accessToken: string;
  user: User;
}
