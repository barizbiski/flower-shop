import { useMemo, useState } from 'react';
import { AuthContext } from './authContext';
import type { AuthProviderProps, User } from './types';

/**
 * Minimal auth state, seeded from the register response.
 * The login-logout spec backs this with GET /api/auth/me so it survives a reload.
 */
export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
