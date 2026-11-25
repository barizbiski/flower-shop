import { createContext } from 'react';
import type { AuthState } from './types';

/** Provided by <AuthProvider>; read it with useAuth(). */
export const AuthContext = createContext<AuthState | null>(null);
