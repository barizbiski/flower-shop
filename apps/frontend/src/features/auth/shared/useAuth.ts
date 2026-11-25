import { useContext } from 'react';
import { AuthContext } from './authContext';
import type { AuthState } from './auth.types';

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
