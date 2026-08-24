'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthSession, BackendAuthConfig, PortalKind } from './types';
import { defaultSession, loadSession, saveSession } from './session';
import { fetchBackendAuthConfig, mintDevToken } from './apiClient';

type AuthContextValue = {
  portal: PortalKind;
  session: AuthSession;
  backendConfig: BackendAuthConfig | null;
  loading: boolean;
  updateSession: (patch: Partial<AuthSession>) => void;
  resetSession: () => void;
  mintJwt: () => Promise<void>;
  setExternalToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  portal,
  children,
}: {
  portal: PortalKind;
  children: ReactNode;
}) {
  const [session, setSession] = useState<AuthSession>(() => defaultSession(portal));
  const [backendConfig, setBackendConfig] = useState<BackendAuthConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(loadSession(portal));
    fetchBackendAuthConfig()
      .then(setBackendConfig)
      .catch(() => setBackendConfig(null))
      .finally(() => setLoading(false));
  }, [portal]);

  const persist = useCallback((next: AuthSession) => {
    setSession(next);
    saveSession(next);
  }, []);

  const updateSession = useCallback(
    (patch: Partial<AuthSession>) => {
      persist({ ...session, ...patch });
    },
    [persist, session],
  );

  const resetSession = useCallback(() => {
    persist(defaultSession(portal));
  }, [persist, portal]);

  const mintJwt = useCallback(async () => {
    const token = await mintDevToken({
      sub: session.sub,
      scope: session.scope,
      purpose: session.purpose,
    });
    persist({ ...session, token, mode: 'jwt' });
  }, [persist, session]);

  const setExternalToken = useCallback(
    (token: string) => {
      persist({ ...session, token, mode: 'external' });
    },
    [persist, session],
  );

  const value = useMemo(
    () => ({
      portal,
      session,
      backendConfig,
      loading,
      updateSession,
      resetSession,
      mintJwt,
      setExternalToken,
    }),
    [portal, session, backendConfig, loading, updateSession, resetSession, mintJwt, setExternalToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
