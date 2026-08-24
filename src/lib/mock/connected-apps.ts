import type { PatientAccount } from '@/lib/types/patient-account';
import { FHIR_RESOURCE_TYPES } from '@/lib/mock/consent-records';

export type ConnectedAppStatus = 'connected' | 'authorized' | 'pending' | 'disconnected' | 'revoked';

export type ConnectedAppTone =
  | 'healthex'
  | 'trialcliniq'
  | 'site'
  | 'lab'
  | 'pharmacy'
  | 'care';

export type ConnectedApp = {
  id: string;
  name: string;
  publisher: string;
  description: string;
  status: ConnectedAppStatus;
  purpose?: string;
  category: string;
  scopes: string[];
  connectedAt?: string;
  lastAccessedAt?: string;
  patientId?: string;
  logoInitials: string;
  logoTone: ConnectedAppTone;
  /** Core apps tied to HealthEx consent; secondary apps can be toggled independently. */
  isCore?: boolean;
  requiresHealthExConsent?: boolean;
};

const STORAGE_KEY = 'trialcliniq.patient.connected-apps';

/** Catalog of apps that can receive HealthEx-authorized data (demo). */
export const CONNECTED_APP_CATALOG: Omit<
  ConnectedApp,
  'status' | 'connectedAt' | 'lastAccessedAt' | 'patientId'
>[] = [
  {
    id: 'healthex',
    name: 'HealthEx Digital Health Wallet',
    publisher: 'HealthEx',
    description:
      'Identity verification (CLEAR), TEFCA record retrieval, and consent capture for sharing FHIR health data with authorized apps.',
    purpose: 'Individual Access / Data transport',
    category: 'Health network',
    scopes: ['patient/*.read', 'openid', 'fhirUser'],
    logoInitials: 'HX',
    logoTone: 'healthex',
    isCore: true,
    requiresHealthExConsent: true,
  },
  {
    id: 'trialcliniq',
    name: 'TrialClinIQ Matching',
    publisher: 'TrialClinIQ',
    description:
      'Receives HealthEx FHIR records for clinical trial matching, eligibility rules, and coordinator review under research purpose of use.',
    purpose: 'RESRCH — Clinical trial matching',
    category: 'Clinical research',
    scopes: [...FHIR_RESOURCE_TYPES],
    logoInitials: 'TC',
    logoTone: 'trialcliniq',
    isCore: true,
    requiresHealthExConsent: true,
  },
  {
    id: 'boston-crc',
    name: 'Boston Clinical Research Center',
    publisher: 'BCRC Site Portal',
    description:
      'Site coordinators review matched candidates, schedule screening, and track enrollment for trials you expressed interest in.',
    purpose: 'RESRCH — Site screening & enrollment',
    category: 'Research site',
    scopes: ['Patient', 'Condition', 'MedicationRequest', 'Observation'],
    logoInitials: 'BC',
    logoTone: 'site',
    requiresHealthExConsent: true,
  },
  {
    id: 'cambridge-metabolic',
    name: 'Cambridge Metabolic Research Site',
    publisher: 'CMRS',
    description:
      'Diabetes and metabolic trial site using shared consent to review eligibility labs and medication history.',
    purpose: 'RESRCH — Metabolic trial screening',
    category: 'Research site',
    scopes: ['Patient', 'Observation', 'MedicationRequest'],
    logoInitials: 'CM',
    logoTone: 'site',
    requiresHealthExConsent: true,
  },
  {
    id: 'labbridge',
    name: 'LabBridge Results Viewer',
    publisher: 'LabBridge',
    description:
      'Secure viewer for recent laboratory observations pulled through HealthEx for screening preparation.',
    purpose: 'RESRCH — Lab review',
    category: 'Diagnostics',
    scopes: ['Observation', 'DiagnosticReport'],
    logoInitials: 'LB',
    logoTone: 'lab',
    requiresHealthExConsent: true,
  },
  {
    id: 'medsync-pharmacy',
    name: 'MedSync Pharmacy Network',
    publisher: 'MedSync',
    description:
      'Medication history enrichment used by eligibility rules to confirm active prescriptions and interactions.',
    purpose: 'RESRCH — Medication history',
    category: 'Pharmacy',
    scopes: ['MedicationRequest', 'AllergyIntolerance'],
    logoInitials: 'MS',
    logoTone: 'pharmacy',
    requiresHealthExConsent: true,
  },
  {
    id: 'care-gap-assist',
    name: 'Care Gap Assist',
    publisher: 'TrialClinIQ Clinical Intelligence',
    description:
      'Surfaces care-gap and referral insights after human coordinator review — never before your consent.',
    purpose: 'RESRCH — Care coordination',
    category: 'Care coordination',
    scopes: ['Condition', 'Encounter', 'CarePlan'],
    logoInitials: 'CG',
    logoTone: 'care',
    requiresHealthExConsent: true,
  },
];

const DEFAULT_SECONDARY_WHEN_CONSENTED = [
  'boston-crc',
  'labbridge',
  'medsync-pharmacy',
];

type StoreShape = {
  /** Secondary app ids the patient has authorized. */
  authorizedIds: string[];
  revokedIds: string[];
};

function loadStore(): StoreShape {
  if (typeof window === 'undefined') {
    return { authorizedIds: [], revokedIds: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { authorizedIds: [], revokedIds: [] };
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    return {
      authorizedIds: parsed.authorizedIds ?? [],
      revokedIds: parsed.revokedIds ?? [],
    };
  } catch {
    return { authorizedIds: [], revokedIds: [] };
  }
}

function saveStore(store: StoreShape): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function hoursAgo(iso: string | undefined, hours: number): string | undefined {
  if (!iso) return undefined;
  return new Date(new Date(iso).getTime() + hours * 3_600_000).toISOString();
}

/**
 * Returns all connected / available apps for the patient.
 * When HealthEx research consent is active, core apps + authorized secondary apps are shown.
 */
export function getConnectedApps(account: PatientAccount | null): ConnectedApp[] {
  if (!account) return [];

  const store = loadStore();
  const consented =
    account.consentStatus === 'granted' && account.healthExConnected;
  const revokedAll = account.consentStatus === 'revoked';
  const denied = account.consentStatus === 'denied';
  const linked =
    account.healthExConnected ||
    Boolean(account.healthExPatientId) ||
    Boolean(account.healthexSessionActive) ||
    account.consentStatus === 'granted';

  // Seed secondary apps once when consent is active and store is empty
  if (consented && store.authorizedIds.length === 0 && store.revokedIds.length === 0) {
    const seeded = { authorizedIds: [...DEFAULT_SECONDARY_WHEN_CONSENTED], revokedIds: [] };
    saveStore(seeded);
    store.authorizedIds = seeded.authorizedIds;
  }

  if (!linked && account.consentStatus === 'none') {
    return [];
  }

  return CONNECTED_APP_CATALOG.map((base, index) => {
    let status: ConnectedAppStatus = 'disconnected';
    let connectedAt: string | undefined;
    let lastAccessedAt: string | undefined;
    let patientId: string | undefined;

    if (base.id === 'healthex') {
      status = revokedAll
        ? 'revoked'
        : consented || account.healthExConnected
          ? 'connected'
          : denied
            ? 'disconnected'
            : linked
              ? 'connected'
              : 'disconnected';
      connectedAt = account.consentGrantedAt;
      patientId = account.healthExPatientId;
      lastAccessedAt = hoursAgo(account.consentGrantedAt, 2);
    } else if (base.id === 'trialcliniq') {
      status = consented
        ? 'authorized'
        : revokedAll
          ? 'revoked'
          : denied
            ? 'disconnected'
            : 'pending';
      connectedAt = account.consentGrantedAt;
      lastAccessedAt = hoursAgo(account.consentGrantedAt, 4);
    } else if (base.requiresHealthExConsent) {
      if (revokedAll) {
        status = 'revoked';
      } else if (!consented) {
        status = 'disconnected';
      } else if (store.revokedIds.includes(base.id)) {
        status = 'revoked';
      } else if (store.authorizedIds.includes(base.id)) {
        status = 'authorized';
        connectedAt = hoursAgo(account.consentGrantedAt, index);
        lastAccessedAt = hoursAgo(account.consentGrantedAt, index + 6);
      } else {
        status = 'pending';
      }
    }

    return {
      ...base,
      status,
      connectedAt,
      lastAccessedAt,
      patientId,
    };
  }).filter((app) => {
    // When not consented, only show core apps that are relevant
    if (!consented && !revokedAll && !denied) {
      return app.isCore;
    }
    if (denied && !linked) {
      return app.isCore;
    }
    // Always show authorized, connected, revoked, and pending (available to connect)
    return (
      app.status !== 'disconnected' ||
      app.isCore ||
      (consented && !store.authorizedIds.includes(app.id) && !store.revokedIds.includes(app.id))
    );
  });
}

export function authorizeConnectedApp(appId: string): void {
  const store = loadStore();
  store.revokedIds = store.revokedIds.filter((id) => id !== appId);
  if (!store.authorizedIds.includes(appId)) {
    store.authorizedIds.push(appId);
  }
  saveStore(store);
}

export function revokeConnectedApp(appId: string): void {
  const catalog = CONNECTED_APP_CATALOG.find((a) => a.id === appId);
  if (catalog?.isCore) return;
  const store = loadStore();
  store.authorizedIds = store.authorizedIds.filter((id) => id !== appId);
  if (!store.revokedIds.includes(appId)) {
    store.revokedIds.push(appId);
  }
  saveStore(store);
}

export function getAvailableAppsToConnect(account: PatientAccount | null): ConnectedApp[] {
  if (!account || !(account.consentStatus === 'granted' && account.healthExConnected)) {
    return [];
  }
  const store = loadStore();
  return CONNECTED_APP_CATALOG.filter(
    (app) =>
      !app.isCore &&
      !store.authorizedIds.includes(app.id) &&
      !store.revokedIds.includes(app.id),
  ).map((app) => ({
    ...app,
    status: 'pending' as const,
  }));
}

export function getConnectedAppStatusLabel(status: ConnectedAppStatus): string {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'authorized':
      return 'Authorized';
    case 'pending':
      return 'Available';
    case 'revoked':
      return 'Revoked';
    default:
      return 'Not connected';
  }
}

export function countActiveConnectedApps(apps: ConnectedApp[]): number {
  return apps.filter((a) => a.status === 'connected' || a.status === 'authorized').length;
}
