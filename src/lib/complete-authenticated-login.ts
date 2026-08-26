import type { AuthSession, BackendAuthConfig } from '@trialcliniq/shared-ui';
import type { PatientAccount } from '@/lib/types/patient-account';
import { saveAccount } from '@/lib/mock/patient-account-store';
import { establishPatientSession } from '@/lib/patient-auth-bridge';
import {
  loadDevClinicalProfile,
  syncDevAccountToLocal,
  syncHealthExStatus,
  type DevPatientAccount,
} from '@/lib/patient-dev-accounts';
import type { CachedClinicalRecords } from '@/lib/healthex-clinical';
import { sendWelcomeNotificationIfNeeded } from '@/lib/mock/notifications';

function applyPortalSnapshot(
  synced: PatientAccount,
  snapshot: unknown,
): PatientAccount {
  if (
    !snapshot ||
    typeof snapshot !== 'object' ||
    !('records' in snapshot) ||
    !(snapshot as CachedClinicalRecords).records
  ) {
    return synced;
  }
  const cached = snapshot as CachedClinicalRecords;
  return {
    ...synced,
    clinicalCache: {
      ...cached,
      source: 'database',
      records: {
        vitals: Array.isArray(cached.records.vitals) ? cached.records.vitals : [],
        conditions: Array.isArray(cached.records.conditions)
          ? cached.records.conditions
          : [],
        allergies: Array.isArray(cached.records.allergies)
          ? cached.records.allergies
          : [],
        lastScan: cached.records.lastScan || {
          title: '—',
          facility: '—',
          address: '—',
          date: '—',
        },
        cholesterol: Array.isArray(cached.records.cholesterol)
          ? cached.records.cholesterol
          : [],
        medications: Array.isArray(cached.records.medications)
          ? cached.records.medications
          : [],
        observations: Array.isArray(cached.records.observations)
          ? cached.records.observations
          : [],
        encounters: Array.isArray(cached.records.encounters)
          ? cached.records.encounters
          : [],
      },
    },
    lastIngestRawUri: cached.rawUri || synced.lastIngestRawUri,
    lastIngestAt: cached.fetchedAt || synced.lastIngestAt,
    healthExConnected: true,
    consentStatus: 'granted',
    consentGrantedAt: synced.consentGrantedAt || new Date().toISOString(),
  };
}

type AuthBridgeCtx = {
  session: AuthSession;
  backendConfig: BackendAuthConfig | null;
  updateSession: (patch: Partial<AuthSession>) => void;
  resetSession: () => void;
};

/**
 * Shared post-auth path for password and Google login: sync local account,
 * hydrate clinical snapshot when available, mint/store session, navigate.
 * Clinical data comes from HealthEx / Postgres — never from invented dummy seed.
 */
export async function completeAuthenticatedLogin(input: {
  apiAccount: DevPatientAccount;
  accessToken?: string;
  /** Local-only placeholder; Google accounts have no portal password. */
  localPassword?: string;
  auth: AuthBridgeCtx;
  replaceAccount: (account: PatientAccount) => void;
  showWelcome?: boolean;
  navigate: (href: string) => void;
}): Promise<void> {
  const password = input.localPassword ?? '';
  let synced = syncDevAccountToLocal(input.apiAccount, password);

  if (!synced.healthExReferenceId || !synced.enterprisePatientId) {
    try {
      const hx = await syncHealthExStatus(synced.email);
      if (hx.account) {
        synced = syncDevAccountToLocal(hx.account, password);
      }
    } catch {
      // Non-blocking — Connect page can still sync manually.
    }
  }

  try {
    const clinical = await loadDevClinicalProfile(synced.email);
    if (clinical.account) {
      synced = {
        ...synced,
        enterprisePatientId:
          clinical.account.enterprisePatientId || synced.enterprisePatientId,
        healthExReferenceId:
          clinical.account.healthExReferenceId || synced.healthExReferenceId,
        healthExPatientId:
          clinical.account.healthExPatientId || synced.healthExPatientId,
        healthexConsentStatus:
          clinical.account.healthexConsentStatus || synced.healthexConsentStatus,
        healthexRetrievalStatus:
          clinical.account.healthexRetrievalStatus ||
          synced.healthexRetrievalStatus,
        consentReferenceId:
          clinical.account.consentReferenceId || synced.consentReferenceId,
      };
    }

    synced = applyPortalSnapshot(synced, clinical.portalSnapshot);

    if (!synced.clinicalCache?.records && clinical.profile && !('error' in clinical.profile)) {
      const { mapClinicalProfileToCache } = await import('@/lib/clinical-profile-mapper');
      const cache = mapClinicalProfileToCache({
        profile: clinical.profile as import('@/lib/patient-api').PatientClinicalProfile,
        referenceId: synced.healthExReferenceId || synced.id,
        source: 'database',
      });
      synced = {
        ...synced,
        clinicalCache: cache,
        healthExConnected: true,
        consentStatus: 'granted',
        consentGrantedAt: synced.consentGrantedAt || new Date().toISOString(),
      };
    } else if (synced.healthexConsentStatus === 'CONSENTED') {
      synced = {
        ...synced,
        healthExConnected: true,
        consentStatus: synced.consentStatus === 'none' ? 'granted' : synced.consentStatus,
        consentGrantedAt: synced.consentGrantedAt || new Date().toISOString(),
      };
    }
  } catch {
    // Dashboard hydrate will retry DB load + live HealthEx fetch.
  }

  const loggedIn = { ...synced, isLoggedIn: true, emailVerified: true };
  saveAccount(loggedIn);
  input.replaceAccount(loggedIn);

  await establishPatientSession(loggedIn, input.auth, {
    accessToken: input.accessToken,
  });
  sendWelcomeNotificationIfNeeded(loggedIn.id);
  input.navigate(input.showWelcome ? '/profile/welcome' : '/dashboard');
}
