import type { ConsentStatus, PatientAccount } from '@/lib/types/patient-account';

export const FHIR_RESOURCE_TYPES = [
  'Patient',
  'Observation',
  'Condition',
  'Encounter',
  'MedicationRequest',
] as const;

export type ConsentHistoryEvent = {
  id: string;
  type: 'granted' | 'data_fetched' | 'revoked' | 'denied';
  label: string;
  description: string;
  timestamp: string;
};

export function getConsentHistory(account: PatientAccount | null): ConsentHistoryEvent[] {
  if (!account) return [];

  const events: ConsentHistoryEvent[] = [];

  if (account.consentGrantedAt) {
    events.push({
      id: 'hist-granted',
      type: 'granted',
      label: 'Research consent granted',
      description: 'You authorized TrialClinIQ to access health records via HealthEx for clinical trial matching.',
      timestamp: account.consentGrantedAt,
    });
    events.push({
      id: 'hist-fetch',
      type: 'data_fetched',
      label: 'Health records retrieved',
      description: 'FHIR resources imported from HealthEx and stored in the TrialClinIQ raw zone.',
      timestamp: new Date(new Date(account.consentGrantedAt).getTime() + 60_000).toISOString(),
    });
  }

  if (account.consentStatus === 'denied') {
    events.push({
      id: 'hist-denied',
      type: 'denied',
      label: 'Authorization denied',
      description: 'You declined TrialClinIQ access to your health records.',
      timestamp: new Date().toISOString(),
    });
  }

  if (account.consentRevokedAt) {
    events.push({
      id: 'hist-revoked',
      type: 'revoked',
      label: 'Consent revoked',
      description: 'You revoked research authorization. TrialClinIQ can no longer access your health data.',
      timestamp: account.consentRevokedAt,
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getConsentStatusLabel(status: ConsentStatus): string {
  switch (status) {
    case 'granted':
      return 'Active';
    case 'revoked':
      return 'Revoked';
    case 'denied':
      return 'Denied';
    default:
      return 'Not authorized';
  }
}
