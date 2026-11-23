import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Minimal auth state, seeded from the register response.
 * The login-logout spec backs this with GET /api/auth/me so it survives a reload.
 */
export function AuthProvider({ children, initialUser = null }: { children: ReactNode; initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
