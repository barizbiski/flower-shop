import type { PublicUser } from '@flower-shop/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { setSessionExpiredHandler } from '../../../lib/apiClient';
import { logoutUser, refreshSession } from './auth.api';
import { AuthContext } from './authContext';
import type { AuthProviderProps, AuthStatus } from './auth.types';

/**
 * Auth state for the app. The access token lives only in memory (inside apiClient); on mount the
 * provider calls /refresh, so a logged-in shopper stays logged in across reloads. `status` is
 * `loading` until that settles.
 */
export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const seeded = initialUser !== undefined;
  const [user, setUser] = useState<PublicUser | null>(initialUser ?? null);
  const [status, setStatus] = useState<AuthStatus>(seeded ? 'ready' : 'loading');

  useEffect(() => {
    if (seeded) return;
    let active = true;
    refreshSession().then((restored) => {
      if (!active) return;
      setUser(restored);
      setStatus('ready');
    });
    return () => {
      active = false;
    };
  }, [seeded]);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    return () => setSessionExpiredHandler(null);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, status, setUser, logout }), [user, status, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
