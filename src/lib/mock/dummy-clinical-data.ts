import { MOCK_MAPPED_ENCOUNTERS } from '@/lib/mock/backend-encounters';
import {
  MOCK_MAPPED_CONDITIONS,
  MOCK_MAPPED_MEDICATIONS,
  MOCK_MAPPED_OBSERVATIONS,
} from '@/lib/mock/backend-clinical';
import { MOCK_HEALTH_RECORDS } from '@/lib/mock/health-records';
import type { CachedClinicalRecords } from '@/lib/healthex-clinical';
import type { EncounterRecord, HealthRecords } from '@/lib/types/health-records';

/** Mapped encounter rows from the backend `clinical.encounters` sample payload. */
export const DUMMY_FHIR_ENCOUNTERS: EncounterRecord[] = MOCK_MAPPED_ENCOUNTERS;

export function buildDummyHealthRecords(): HealthRecords {
  return {
    ...MOCK_HEALTH_RECORDS,
    conditions: MOCK_MAPPED_CONDITIONS,
    medications: MOCK_MAPPED_MEDICATIONS,
    observations: MOCK_MAPPED_OBSERVATIONS,
    encounters: DUMMY_FHIR_ENCOUNTERS,
    lastScan: {
      title: 'Chest X-Ray',
      facility: 'NewAge Hospital — Radiology',
      address: '123 Medical Center Dr, Boston, MA 02115',
      date: '15 Jun 2026, 11:00 AM',
    },
  };
}

export function buildDummyCachedClinicalRecords(params: {
  referenceId: string;
  patientId?: string;
  enterprisePatientId?: string;
}): CachedClinicalRecords {
  const records = buildDummyHealthRecords();
  return {
    fetchedAt: new Date().toISOString(),
    referenceId: params.referenceId,
    patientId: params.patientId || params.enterprisePatientId || 'HX-DUMMY-001',
    consentStatus: 'CONSENTED',
    retrievalStatus: 'COMPLETED',
    rawUri: 'dummy://local/clinical-bundle.json',
    transactionId: `dummy-${Date.now()}`,
    resourceCounts: {
      Patient: 1,
      Condition: records.conditions.length,
      MedicationRequest: records.medications.length,
      Observation: records.observations.length,
      Encounter: records.encounters.length,
      AllergyIntolerance: records.allergies.length,
    },
    records,
    source: 'dummy',
  };
}

/** Normalized profile shape for reporting-service Postgres upsert. */
export function buildDummyReportingProfile(params: {
  enterpriseId: string;
  patientId: string;
}) {
  const records = buildDummyHealthRecords();
  return {
    enterprise_id: params.enterpriseId,
    patient_id: params.patientId,
    profile: {
      age: 41,
      diagnoses: records.conditions.map((c) => c.name),
      medications: records.medications.map((m) => m.name),
      procedures: [{ code: '71046', date: '2026-06-15' }],
      observations: records.observations.map((o) => ({
        display: o.name,
        code: o.name,
        abnormal: o.value === 'Abnormal',
      })),
      encounters: records.encounters.map((e) => ({
        id: e.id,
        type: e.type,
        date: e.date,
        status: e.status,
        facility: e.facility,
        provider: e.provider,
        reason: e.reason,
        class: e.classCode,
      })),
    },
  };
}
