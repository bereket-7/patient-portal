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
import type { PatientAccount, RegistrationInput } from '@/lib/types/patient-account';
import {
  clearAccount,
  denyHealthExConsent,
  grantHealthExConsent,
  loadAccount,
  loginAccount,
  logoutAccount,
  registerAccount,
  saveAccount,
  startHealthExSession,
  updateAccount,
  verifyEmail,
  verifyPhone,
  revokeHealthExConsent,
} from '@/lib/mock/patient-account-store';

type PatientAccountContextValue = {
  account: PatientAccount | null;
  loading: boolean;
  register: (input: RegistrationInput) => PatientAccount;
  confirmEmail: () => void;
  confirmPhone: () => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  connectHealthEx: () => void;
  grantConsent: () => void;
  denyConsent: () => void;
  revokeConsent: () => void;
  resetAccount: () => void;
  /** Replace local account snapshot (e.g. after sync-healthex). */
  replaceAccount: (next: PatientAccount) => void;
};

const PatientAccountContext = createContext<PatientAccountContextValue | null>(null);

export function PatientAccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<PatientAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadAccount();
    setAccount(stored);
    setLoading(false);

    const syncFromStorage = () => setAccount(loadAccount());
    window.addEventListener('focus', syncFromStorage);
    return () => window.removeEventListener('focus', syncFromStorage);
  }, []);

  const register = useCallback((input: RegistrationInput) => {
    const next = registerAccount(input);
    setAccount(next);
    return next;
  }, []);

  const confirmEmail = useCallback(() => {
    const current = loadAccount();
    if (!current) return;
    const next = verifyEmail(current);
    setAccount(next);
  }, []);

  const confirmPhone = useCallback(() => {
    const current = loadAccount();
    if (!current) return;
    const next = verifyPhone(current);
    setAccount(next);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const current = loadAccount();
    if (!current) return false;
    const next = loginAccount(current, email, password);
    if (!next) return false;
    setAccount(next);
    return true;
  }, []);

  const logout = useCallback(() => {
    setAccount((prev) => {
      if (!prev) return prev;
      const next = logoutAccount(prev);
      return next;
    });
  }, []);

  const connectHealthEx = useCallback(() => {
    setAccount((prev) => {
      if (!prev) return prev;
      const next = startHealthExSession(prev);
      return next;
    });
  }, []);

  const grantConsent = useCallback(() => {
    setAccount((prev) => {
      if (!prev) return prev;
      const next = grantHealthExConsent(prev);
      return next;
    });
  }, []);

  const denyConsent = useCallback(() => {
    setAccount((prev) => {
      if (!prev) return prev;
      const next = denyHealthExConsent(prev);
      return next;
    });
  }, []);

  const revokeConsent = useCallback(() => {
    setAccount((prev) => {
      if (!prev) return prev;
      const next = revokeHealthExConsent(prev);
      return next;
    });
  }, []);

  const resetAccount = useCallback(() => {
    clearAccount();
    setAccount(null);
  }, []);

  const replaceAccount = useCallback((next: PatientAccount) => {
    saveAccount(next);
    setAccount(next);
  }, []);

  const value = useMemo(
    () => ({
      account,
      loading,
      register,
      confirmEmail,
      confirmPhone,
      login,
      logout,
      connectHealthEx,
      grantConsent,
      denyConsent,
      revokeConsent,
      resetAccount,
      replaceAccount,
    }),
    [
      account,
      loading,
      register,
      confirmEmail,
      confirmPhone,
      login,
      logout,
      connectHealthEx,
      grantConsent,
      denyConsent,
      revokeConsent,
      resetAccount,
      replaceAccount,
    ],
  );

  return <PatientAccountContext.Provider value={value}>{children}</PatientAccountContext.Provider>;
}

export function usePatientAccount() {
  const ctx = useContext(PatientAccountContext);
  if (!ctx) {
    throw new Error('usePatientAccount must be used within PatientAccountProvider');
  }
  return ctx;
}

export function usePatientAccountOptional() {
  return useContext(PatientAccountContext);
}

export { updateAccount, saveAccount };
