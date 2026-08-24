import { MOCK_HEALTH_RECORDS } from '@/lib/mock/health-records';
import type { CachedClinicalRecords } from '@/lib/healthex-clinical';
import type { EncounterRecord, HealthRecords } from '@/lib/types/health-records';

/** FHIR-style encounter rows (HealthEx $everything summary shape). */
export const DUMMY_FHIR_ENCOUNTERS: EncounterRecord[] = [
  {
    id: 'enc-001',
    type: 'Ambulatory · Follow-up',
    date: '2026-06-15T10:30:00Z',
    status: 'finished',
    facility: 'NewAge Hospital — Primary Care',
    provider: 'Dr. Emily Hartwell',
    reason: 'Hypertension management & medication review',
    classCode: 'AMB',
  },
  {
    id: 'enc-002',
    type: 'Outpatient · Diagnostic imaging',
    date: '2026-06-15T11:00:00Z',
    status: 'finished',
    facility: 'NewAge Hospital — Radiology',
    provider: 'Dr. James Okonkwo',
    reason: 'Chest X-Ray — routine screening',
    classCode: 'AMB',
  },
  {
    id: 'enc-003',
    type: 'Laboratory',
    date: '2026-06-01T08:15:00Z',
    status: 'finished',
    facility: 'Boston Clinical Labs',
    provider: 'Lab Services',
    reason: 'Lipid panel & HbA1c',
    classCode: 'VR',
  },
  {
    id: 'enc-004',
    type: 'Emergency',
    date: '2025-11-22T19:40:00Z',
    status: 'finished',
    facility: 'Mass General Emergency Dept',
    provider: 'Dr. Sarah Chen',
    reason: 'Acute urinary symptoms — UTI workup',
    classCode: 'EMER',
  },
  {
    id: 'enc-005',
    type: 'Ambulatory · Annual wellness',
    date: '2025-04-10T09:00:00Z',
    status: 'finished',
    facility: 'Cambridge Family Medicine',
    provider: 'Dr. Priya Nair',
    reason: 'Annual physical & preventive screening',
    classCode: 'AMB',
  },
];

export function buildDummyHealthRecords(): HealthRecords {
  return {
    ...MOCK_HEALTH_RECORDS,
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
