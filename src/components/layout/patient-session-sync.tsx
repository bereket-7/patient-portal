'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@trialcliniq/shared-ui';
import { usePatientAccount } from '@/providers/patient-account-provider';
import { isPatientAuthenticated } from '@/lib/patient-auth';
import { clearPatientSession, establishPatientSession } from '@/lib/patient-auth-bridge';
import { loadAccount } from '@/lib/mock/patient-account-store';

/**
 * Restores the gateway JWT session when the patient account is logged in
 * but the authenticated flag / session was lost (e.g. partial localStorage clear).
 */
export function PatientSessionSync() {
  const { account, loading: accountLoading, logout } = usePatientAccount();
  const { session, backendConfig, loading: authLoading, updateSession, resetSession } = useAuth();
  const restoring = useRef(false);

  useEffect(() => {
    if (accountLoading || authLoading || restoring.current) return;

    const effective = account ?? loadAccount();
    if (!effective?.isLoggedIn) return;
    if (isPatientAuthenticated() && session.token) return;

    restoring.current = true;
    establishPatientSession(effective, {
      session,
      backendConfig,
      updateSession,
      resetSession,
    })
      .catch(() => {
        // Mint failed with JWKS / mint required — drop half-authenticated state.
        if (backendConfig?.jwksEnabled || backendConfig?.mintEnabled) {
          logout();
          clearPatientSession({ resetSession });
        }
      })
      .finally(() => {
        restoring.current = false;
      });
  }, [
    account,
    accountLoading,
    authLoading,
    backendConfig,
    logout,
    resetSession,
    session,
    updateSession,
  ]);

  return null;
}
