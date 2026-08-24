import type { CachedClinicalRecords } from '@/lib/healthex-clinical';

export type ConsentStatus = 'none' | 'granted' | 'denied' | 'revoked';

export type PatientAccount = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  passwordHash: string;
  gender?: string;
  address?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isLoggedIn: boolean;
  healthExConnected: boolean;
  healthExReferenceId?: string;
  healthExPatientId?: string;
  enterprisePatientId?: string;
  backendConsentId?: string;
  healthexAccessToken?: string;
  consentReferenceId?: string;
  healthexConsentStatus?: string;
  healthexRetrievalStatus?: string;
  healthexLinkError?: string;
  /** Clinical FHIR snapshot after consented fetch. */
  clinicalCache?: CachedClinicalRecords;
  lastIngestRawUri?: string;
  lastIngestAt?: string;
  consentStatus: ConsentStatus;
  consentGrantedAt?: string;
  consentRevokedAt?: string;
  mockAccessToken?: string;
  healthexSessionActive?: boolean;
};

export type RegistrationInput = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  address?: string;
};

export type RegistrationStep = 'register' | 'verify-email' | 'verify-phone' | 'complete';

export function isRegistrationComplete(account: PatientAccount | null): boolean {
  return Boolean(account?.emailVerified && account?.phoneVerified);
}

export function getRegistrationStep(account: PatientAccount | null): RegistrationStep {
  if (!account) return 'register';
  if (!account.emailVerified) return 'verify-email';
  if (!account.phoneVerified) return 'verify-phone';
  return 'complete';
}

export function getDisplayName(account: PatientAccount): string {
  return `${account.firstName} ${account.lastName}`;
}
