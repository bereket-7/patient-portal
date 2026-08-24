import {
  mapClinicalToHealthRecords,
  type HealthExClinicalSummary,
} from '@/lib/healthex-clinical';
import type { EncounterRecord } from '@/lib/types/health-records';

/**
 * Sample `clinical.encounters[]` rows.
 * Matches ingestion `summarizeFhirResources()` and reporting `PatientClinicalProfile.encounters`.
 */
export const MOCK_BACKEND_ENCOUNTERS: NonNullable<HealthExClinicalSummary['encounters']> = [
  {
    id: 'enc-followup-2026-06-15',
    type: 'Follow-up visit',
    date: '2026-06-15T10:30:00.000Z',
    status: 'finished',
    facility: 'NewAge Hospital Primary Care',
    provider: 'Dr. Emily Hartwell',
    reason: 'Hypertension management and medication review',
    class: 'ambulatory',
  },
  {
    id: 'enc-imaging-2026-06-15',
    type: 'Diagnostic imaging',
    date: '2026-06-15T11:00:00.000Z',
    status: 'finished',
    facility: 'NewAge Hospital Radiology',
    provider: 'Dr. James Okonkwo',
    reason: 'Chest X-ray — routine screening',
    class: 'ambulatory',
  },
  {
    id: 'enc-lab-2026-06-01',
    type: 'Laboratory visit',
    date: '2026-06-01T08:15:00.000Z',
    status: 'finished',
    facility: 'Boston Clinical Labs',
    provider: 'Lab Services',
    reason: 'Lipid panel and HbA1c',
    class: 'virtual',
  },
  {
    id: 'enc-ed-2025-11-22',
    type: 'Emergency visit',
    date: '2025-11-22T19:40:00.000Z',
    status: 'finished',
    facility: 'Massachusetts General Hospital Emergency Department',
    provider: 'Dr. Sarah Chen',
    reason: 'Acute urinary symptoms — UTI workup',
    class: 'emergency',
  },
  {
    id: 'enc-wellness-2025-04-10',
    type: 'Annual wellness visit',
    date: '2025-04-10T09:00:00.000Z',
    status: 'finished',
    facility: 'Cambridge Family Medicine',
    provider: 'Dr. Priya Nair',
    reason: 'Annual physical and preventive screening',
    class: 'ambulatory',
  },
  {
    id: 'enc-telehealth-2026-07-08',
    type: 'Telehealth follow-up',
    date: '2026-07-08T14:00:00.000Z',
    status: 'in-progress',
    facility: 'TrialClinIQ Virtual Clinic',
    provider: 'Dr. Emily Hartwell',
    reason: 'Diabetes check-in and glucose review',
    class: 'virtual',
  },
  {
    id: 'enc-screening-2026-08-20',
    type: 'Office visit',
    date: '2026-08-20T16:30:00.000Z',
    status: 'planned',
    facility: 'NewAge Hospital Primary Care',
    provider: 'Dr. Emily Hartwell',
    reason: 'Clinical trial screening visit',
    class: 'ambulatory',
  },
];

/** Envelope matching HealthEx ingest `clinical` when include_clinical=true. */
export const MOCK_BACKEND_CLINICAL_ENCOUNTERS: Pick<
  HealthExClinicalSummary,
  'available' | 'resource_counts' | 'total_resources' | 'encounters'
> = {
  available: true,
  resource_counts: { Encounter: MOCK_BACKEND_ENCOUNTERS.length },
  total_resources: MOCK_BACKEND_ENCOUNTERS.length,
  encounters: MOCK_BACKEND_ENCOUNTERS,
};

export const ENCOUNTER_CLASS_LABELS: Record<string, string> = {
  AMB: 'Ambulatory',
  ambulatory: 'Ambulatory',
  EMER: 'Emergency',
  emergency: 'Emergency',
  IMP: 'Inpatient',
  inpatient: 'Inpatient',
  VR: 'Virtual / telehealth',
  virtual: 'Virtual / telehealth',
  HH: 'Home health',
  SS: 'Short stay',
};

export function encounterClassLabel(classCode?: string): string | null {
  if (!classCode) return null;
  return ENCOUNTER_CLASS_LABELS[classCode] || classCode;
}

export function mapBackendEncounters(
  encounters: HealthExClinicalSummary['encounters'] = MOCK_BACKEND_ENCOUNTERS,
): EncounterRecord[] {
  return mapClinicalToHealthRecords({
    available: true,
    resource_counts: { Encounter: encounters.length },
    total_resources: encounters.length,
    conditions: [],
    medications: [],
    observations: [],
    encounters,
  }).encounters;
}

export const MOCK_MAPPED_ENCOUNTERS = mapBackendEncounters();

export function findMockBackendEncounter(id: string) {
  return MOCK_BACKEND_ENCOUNTERS.find((encounter) => encounter.id === id);
}

export function resolveVisits(live: EncounterRecord[]): {
  encounters: EncounterRecord[];
  usingSample: boolean;
} {
  if (live.length > 0) {
    return { encounters: live, usingSample: false };
  }
  return { encounters: MOCK_MAPPED_ENCOUNTERS, usingSample: true };
}
