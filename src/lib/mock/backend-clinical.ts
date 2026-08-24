import {
  mapClinicalToHealthRecords,
  type HealthExClinicalSummary,
} from '@/lib/healthex-clinical';
import type {
  ConditionRecord,
  MedicationRecord,
  ObservationRecord,
} from '@/lib/types/health-records';

function mapClinicalSlice(
  slice: Partial<
    Pick<HealthExClinicalSummary, 'conditions' | 'medications' | 'observations' | 'resource_counts'>
  >,
) {
  const conditions = slice.conditions || [];
  const medications = slice.medications || [];
  const observations = slice.observations || [];
  return mapClinicalToHealthRecords({
    available: true,
    resource_counts: slice.resource_counts || {},
    total_resources:
      (slice.resource_counts
        ? Object.values(slice.resource_counts).reduce((sum, n) => sum + n, 0)
        : 0) ||
      conditions.length + medications.length + observations.length,
    conditions,
    medications,
    observations,
    encounters: [],
  });
}

/**
 * Sample `clinical.conditions[]` rows.
 * Matches ingestion `summarizeFhirResources()` Condition mapping (code, display, onset).
 */
export const MOCK_BACKEND_CONDITIONS: HealthExClinicalSummary['conditions'] = [
  {
    code: 'I10',
    display: 'Essential hypertension (chronic)',
    onset: '2023-08-18T00:00:00.000Z',
  },
  {
    code: 'E11.9',
    display: 'Type 2 diabetes mellitus (chronic)',
    onset: '2024-01-10T00:00:00.000Z',
  },
  {
    code: 'E78.5',
    display: 'Hyperlipidemia',
    onset: '2025-02-22T00:00:00.000Z',
  },
  {
    code: 'J30.2',
    display: 'Seasonal allergic rhinitis',
    onset: '2022-04-05T00:00:00.000Z',
  },
  {
    code: 'H53.10',
    display: 'Night vision impairment — visual complaint',
    onset: '2025-01-12T00:00:00.000Z',
  },
  {
    code: 'N39.0',
    display: 'Acute urinary tract infection',
    onset: '2024-03-03T00:00:00.000Z',
  },
  {
    code: 'M17.11',
    display: 'Osteoarthritis of right knee',
    onset: '2023-09-08T00:00:00.000Z',
  },
];

/**
 * Sample `clinical.medications[]` rows.
 * Matches MedicationRequest / MedicationStatement summary (name, status).
 */
export const MOCK_BACKEND_MEDICATIONS: HealthExClinicalSummary['medications'] = [
  { name: 'Lisinopril', status: 'active' },
  { name: 'Metformin', status: 'active' },
  { name: 'Atorvastatin', status: 'active' },
  { name: 'Amlodipine', status: 'active' },
  { name: 'Omeprazole', status: 'completed' },
  { name: 'Ibuprofen', status: 'stopped' },
];

/**
 * Sample `clinical.observations[]` rows.
 * Matches Observation summary (display, value, date, status).
 */
export const MOCK_BACKEND_OBSERVATIONS: HealthExClinicalSummary['observations'] = [
  { display: 'Glucose', value: '95 mg/dL', date: '2026-07-03T08:00:00.000Z', status: 'final' },
  { display: 'HbA1c', value: '5.8 %', date: '2026-06-01T08:15:00.000Z', status: 'final' },
  { display: 'Total Cholesterol', value: '185 mg/dL', date: '2026-06-01T08:15:00.000Z', status: 'final' },
  { display: 'HDL Cholesterol', value: '55 mg/dL', date: '2026-06-01T08:15:00.000Z', status: 'final' },
  { display: 'LDL Cholesterol', value: '110 mg/dL', date: '2026-06-01T08:15:00.000Z', status: 'final' },
  { display: 'Triglycerides', value: '140 mg/dL', date: '2026-06-01T08:15:00.000Z', status: 'final' },
  { display: 'Creatinine', value: '0.9 mg/dL', date: '2026-05-15T08:00:00.000Z', status: 'preliminary' },
  { display: 'Potassium', value: '4.1 mmol/L', date: '2026-05-15T08:00:00.000Z', status: 'final' },
  { display: 'Blood Pressure', value: '130/84 mmHg', date: '2026-07-04T09:00:00.000Z', status: 'final' },
  { display: 'Heart Rate', value: '72 bpm', date: '2026-07-04T09:00:00.000Z', status: 'final' },
];

export const MOCK_BACKEND_CLINICAL_CONDITIONS = {
  available: true,
  resource_counts: { Condition: MOCK_BACKEND_CONDITIONS.length },
  total_resources: MOCK_BACKEND_CONDITIONS.length,
  conditions: MOCK_BACKEND_CONDITIONS,
};

export const MOCK_BACKEND_CLINICAL_MEDICATIONS = {
  available: true,
  resource_counts: { MedicationRequest: MOCK_BACKEND_MEDICATIONS.length },
  total_resources: MOCK_BACKEND_MEDICATIONS.length,
  medications: MOCK_BACKEND_MEDICATIONS,
};

export const MOCK_BACKEND_CLINICAL_OBSERVATIONS = {
  available: true,
  resource_counts: { Observation: MOCK_BACKEND_OBSERVATIONS.length },
  total_resources: MOCK_BACKEND_OBSERVATIONS.length,
  observations: MOCK_BACKEND_OBSERVATIONS,
};

export const MOCK_MAPPED_CONDITIONS: ConditionRecord[] = mapClinicalSlice({
  conditions: MOCK_BACKEND_CONDITIONS,
  resource_counts: { Condition: MOCK_BACKEND_CONDITIONS.length },
}).conditions;

export const MOCK_MAPPED_MEDICATIONS: MedicationRecord[] = mapClinicalSlice({
  medications: MOCK_BACKEND_MEDICATIONS,
  resource_counts: { MedicationRequest: MOCK_BACKEND_MEDICATIONS.length },
}).medications;

export const MOCK_MAPPED_OBSERVATIONS: ObservationRecord[] = mapClinicalSlice({
  observations: MOCK_BACKEND_OBSERVATIONS,
  resource_counts: { Observation: MOCK_BACKEND_OBSERVATIONS.length },
}).observations;

export function resolveConditions(live: ConditionRecord[]): {
  conditions: ConditionRecord[];
  usingSample: boolean;
} {
  if (live.length > 0) return { conditions: live, usingSample: false };
  return { conditions: MOCK_MAPPED_CONDITIONS, usingSample: true };
}

export function resolveMedications(live: MedicationRecord[]): {
  medications: MedicationRecord[];
  usingSample: boolean;
} {
  if (live.length > 0) return { medications: live, usingSample: false };
  return { medications: MOCK_MAPPED_MEDICATIONS, usingSample: true };
}

export function resolveObservations(live: ObservationRecord[]): {
  observations: ObservationRecord[];
  usingSample: boolean;
} {
  if (live.length > 0) return { observations: live, usingSample: false };
  return { observations: MOCK_MAPPED_OBSERVATIONS, usingSample: true };
}
