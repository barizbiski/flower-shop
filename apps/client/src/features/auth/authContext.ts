import { createContext } from 'react';
import type { User } from './types';

export interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

/** Provided by <AuthProvider>; read it with useAuth(). */
export const AuthContext = createContext<AuthState | null>(null);
