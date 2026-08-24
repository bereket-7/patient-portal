import type { PatientAccount } from '@/lib/types/patient-account';

/**
 * Resolve the platform consent reference for ingest/capture.
 * Prefers HealthEx-issued consentRecordId when available; falls back to portal-scoped id.
 */
export function resolveConsentReferenceId(account: PatientAccount): string | null {
  if (account.consentReferenceId?.trim()) {
    return account.consentReferenceId.trim();
  }
  if (account.healthExReferenceId?.trim()) {
    return `healthex-portal:${account.healthExReferenceId.trim()}`;
  }
  return null;
}

/** Platform consent must be captured before PHI ingest (HealthEx CONSENTED alone is insufficient). */
export function hasPlatformConsent(account: PatientAccount | null | undefined): boolean {
  return account?.consentStatus === 'granted';
}

/** HealthEx-side consent is required before any FHIR fetch. */
export function hasHealthExConsent(account: PatientAccount | null | undefined): boolean {
  return account?.healthexConsentStatus === 'CONSENTED';
}

/**
 * HealthEx retrieval is ready to hydrate into the portal (CONSENTED + reference id).
 * Used to auto-load FHIR clinical summaries without forcing a second consent click.
 */
export function canHydrateHealthExClinical(
  account: PatientAccount | null | undefined,
): boolean {
  return (
    hasHealthExConsent(account) &&
    Boolean(account?.healthExReferenceId?.trim()) &&
    Boolean(account?.healthExPatientId?.trim() || account?.consentReferenceId?.trim())
  );
}

/** Linked to HealthEx but consent email / wallet step not completed yet. */
export function needsHealthExEmailConsent(account: PatientAccount | null | undefined): boolean {
  return hasHealthExLink(account) && !hasHealthExConsent(account);
}

/** Full data access: HealthEx CONSENTED and either platform consent or ready-to-hydrate clinical link. */
export function canAccessHealthData(account: PatientAccount | null | undefined): boolean {
  return (
    hasHealthExConsent(account) &&
    (hasPlatformConsent(account) || canHydrateHealthExClinical(account))
  );
}

export function canAuthorizePlatformConsent(account: PatientAccount | null | undefined): boolean {
  return hasHealthExLink(account) && hasHealthExConsent(account);
}

/** HealthEx project patient is linked (reference id present). */
export function hasHealthExLink(account: PatientAccount | null | undefined): boolean {
  return Boolean(account?.healthExReferenceId?.trim());
}

/**
 * HealthEx is linked and consented, but clinical data has not been hydrated yet.
 * Once CONSENTED, the portal auto-loads FHIR — this is only a short interim state.
 */
export function awaitingFhirFetch(account: PatientAccount | null | undefined): boolean {
  if (!hasHealthExLink(account) || !hasHealthExConsent(account)) return false;
  if (hasPlatformConsent(account)) return false;
  if (account?.clinicalCache?.records) {
    const r = account.clinicalCache.records;
    if (
      (r.conditions?.length || 0) > 0 ||
      (r.medications?.length || 0) > 0 ||
      (r.observations?.length || 0) > 0 ||
      (r.encounters?.length || 0) > 0
    ) {
      return false;
    }
  }
  return !canHydrateHealthExClinical(account);
}

export type HealthExSyncSnapshot = {
  consentStatus?: string | null;
  consentReferenceId?: string | null;
};

/**
 * Merge a live HealthEx sync into the local account.
 * Invalidates platform consent + cached clinical data when HealthEx consent is revoked.
 */
export function mergeHealthExSyncIntoAccount(
  account: PatientAccount,
  sync: HealthExSyncSnapshot,
): PatientAccount {
  const liveConsent = sync.consentStatus ?? account.healthexConsentStatus;
  const nowConsented = liveConsent === 'CONSENTED';
  const hadAccess = canAccessHealthData(account);

  if (hadAccess && !nowConsented) {
    return {
      ...account,
      healthexConsentStatus: liveConsent || account.healthexConsentStatus,
      consentReferenceId: sync.consentReferenceId ?? account.consentReferenceId,
      healthExConnected: false,
      consentStatus: 'none',
      clinicalCache: undefined,
      lastIngestAt: undefined,
      lastIngestRawUri: undefined,
      consentGrantedAt: undefined,
      backendConsentId: undefined,
    };
  }

  return {
    ...account,
    healthexConsentStatus: liveConsent || account.healthexConsentStatus,
    consentReferenceId: sync.consentReferenceId ?? account.consentReferenceId,
    healthExConnected: nowConsented,
  };
}
