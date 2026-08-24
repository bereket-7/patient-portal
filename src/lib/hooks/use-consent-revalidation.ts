'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { PatientAccount } from '@/lib/types/patient-account';
import {
  canAccessHealthData,
  mergeHealthExSyncIntoAccount,
  needsHealthExEmailConsent,
} from '@/lib/healthex-consent';
import {
  mapDevAccountToPatientAccount,
  syncHealthExStatus,
} from '@/lib/patient-dev-accounts';
import {
  sendHealthExConsentPendingNotificationIfNeeded,
  sendWelcomeNotificationIfNeeded,
} from '@/lib/mock/notifications';
import { usePatientAccount } from '@/providers/patient-account-provider';

function healthExFieldsEqual(a: PatientAccount, b: PatientAccount): boolean {
  return (
    a.healthExReferenceId === b.healthExReferenceId &&
    a.healthExPatientId === b.healthExPatientId &&
    a.consentReferenceId === b.consentReferenceId &&
    a.healthexConsentStatus === b.healthexConsentStatus &&
    a.healthexRetrievalStatus === b.healthexRetrievalStatus &&
    a.enterprisePatientId === b.enterprisePatientId &&
    a.healthExConnected === b.healthExConnected &&
    a.consentStatus === b.consentStatus
  );
}

function applySyncResult(
  account: PatientAccount,
  passwordHash: string,
  result: Awaited<ReturnType<typeof syncHealthExStatus>>,
): PatientAccount {
  if (!result.account) return account;
  const base = mapDevAccountToPatientAccount(result.account, passwordHash, {
    isLoggedIn: account.isLoggedIn,
    consentStatus: account.consentStatus,
    clinicalCache: account.clinicalCache,
    backendConsentId: account.backendConsentId,
    consentGrantedAt: account.consentGrantedAt,
    consentRevokedAt: account.consentRevokedAt,
    lastIngestAt: account.lastIngestAt,
    lastIngestRawUri: account.lastIngestRawUri,
    healthExConnected: result.account.healthexConsentStatus === 'CONSENTED',
    consentReferenceId:
      result.healthex?.consent_reference_id || result.account.consentReferenceId,
  });
  return mergeHealthExSyncIntoAccount(base, {
    consentStatus: result.healthex?.consent_status ?? result.account.healthexConsentStatus,
    consentReferenceId:
      result.healthex?.consent_reference_id ?? result.account.consentReferenceId,
  });
}

/**
 * One-shot HealthEx consent status check per login session.
 * Does NOT poll on focus/navigation — HealthEx clinical fetch is on-demand via Sync/Refresh.
 */
export function useConsentRevalidation() {
  const { account, replaceAccount } = usePatientAccount();
  const syncingRef = useRef(false);
  const ranForAccountRef = useRef<string | null>(null);
  const accountRef = useRef(account);
  accountRef.current = account;

  const revalidate = useCallback(async () => {
    const current = accountRef.current;
    if (!current?.email || !current.isLoggedIn || !current.healthExReferenceId) return;
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const result = await syncHealthExStatus(current.email);
      if (!result.account) return;
      const next = applySyncResult(current, current.passwordHash, result);
      if (!healthExFieldsEqual(current, next)) {
        replaceAccount(next);
      }
      sendWelcomeNotificationIfNeeded(current.id);
      if (needsHealthExEmailConsent(next)) {
        sendHealthExConsentPendingNotificationIfNeeded(current.id);
      }
    } finally {
      syncingRef.current = false;
    }
  }, [replaceAccount]);

  useEffect(() => {
    if (!account?.isLoggedIn || !account.id) return;

    sendWelcomeNotificationIfNeeded(account.id);
    if (needsHealthExEmailConsent(account)) {
      sendHealthExConsentPendingNotificationIfNeeded(account.id);
    }

    // At most one background status sync per account login session.
    // Clinical data load is DB-first; HealthEx FHIR fetch is Sync/Refresh only.
    if (ranForAccountRef.current === account.id) return;
    if (!account.healthExReferenceId) {
      ranForAccountRef.current = account.id;
      return;
    }
    ranForAccountRef.current = account.id;
    void revalidate();
  }, [account?.id, account?.isLoggedIn, account?.healthExReferenceId, revalidate]);

  return { revalidate, canAccessData: canAccessHealthData(account) };
}
