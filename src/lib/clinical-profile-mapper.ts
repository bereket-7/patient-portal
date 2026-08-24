import type { CachedClinicalRecords } from '@/lib/healthex-clinical';
import { EMPTY_HEALTH_RECORDS } from '@/lib/mock/health-records';
import type {
  ConditionRecord,
  EncounterRecord,
  HealthRecords,
  MedicationRecord,
  ObservationRecord,
} from '@/lib/types/health-records';
import type { PatientClinicalProfile } from '@/lib/patient-api';

function severityFromName(name: string): ConditionRecord['severity'] {
  const lower = name.toLowerCase();
  if (lower.includes('severe') || lower.includes('acute')) return 'Severe';
  if (lower.includes('moderate') || lower.includes('chronic')) return 'Moderate';
  if (lower.includes('complaint') || lower.includes('symptom')) return 'Complaint';
  return 'Mild';
}

export function mapClinicalProfileToHealthRecords(
  profile: PatientClinicalProfile,
): HealthRecords {
  const conditions: ConditionRecord[] = (profile.diagnoses || []).map((name, i) => ({
    id: `cond-${i}`,
    name,
    period: '—',
    severity: severityFromName(name),
  }));

  const medications: MedicationRecord[] = (profile.medications || []).map((name, i) => ({
    id: `med-${i}`,
    name,
    dosage: '—',
    status: 'Active',
    prescribedDate: '—',
  }));

  const observations: ObservationRecord[] = (profile.observations || []).map((o, i) => ({
    id: `obs-${i}`,
    name: o.display || o.code || 'Observation',
    value:
      typeof (o as { value?: string }).value === 'string' && (o as { value?: string }).value
        ? String((o as { value?: string }).value)
        : o.abnormal
          ? 'Abnormal'
          : '—',
    date: (o as { date?: string }).date || '—',
    status: 'Final',
  }));

  const encounters: EncounterRecord[] = (profile.encounters || []).map((e, i) => ({
    id: e.id || `enc-${i}`,
    type: e.type || 'Visit',
    date: e.date || '—',
    status: e.status || 'finished',
    facility: e.facility,
    provider: e.provider,
    reason: e.reason,
    classCode: e.class || e.classCode,
  }));

  const vitals = observations
    .filter((o) =>
      /blood pressure|heart rate|bmi|weight|spo2|glucose|temperature|pulse/i.test(o.name),
    )
    .slice(0, 6)
    .map((o, i) => ({
      id: `vital-${i}`,
      label: o.name,
      value: o.value === '—' ? '—' : o.value.split(/\s+/)[0],
      unit: '',
      date: o.date,
      color: 'bg-muted',
    }));

  const imagingEncounter = encounters.find((e) =>
    /x-ray|imaging|radiology|scan/i.test(`${e.type} ${e.reason || ''}`),
  );

  return {
    ...EMPTY_HEALTH_RECORDS,
    conditions,
    medications,
    observations,
    encounters,
    vitals,
    lastScan: imagingEncounter
      ? {
          title: imagingEncounter.reason || imagingEncounter.type,
          facility: imagingEncounter.facility || '—',
          address: '—',
          date: imagingEncounter.date,
        }
      : EMPTY_HEALTH_RECORDS.lastScan,
  };
}

export function mapClinicalProfileToCache(params: {
  profile: PatientClinicalProfile;
  referenceId: string;
  source?: CachedClinicalRecords['source'];
}): CachedClinicalRecords {
  const records = mapClinicalProfileToHealthRecords(params.profile);
  return {
    fetchedAt: params.profile.updated_at || new Date().toISOString(),
    referenceId: params.referenceId,
    patientId: params.profile.patient_id,
    resourceCounts: {
      Condition: records.conditions.length,
      MedicationRequest: records.medications.length,
      Observation: records.observations.length,
      Encounter: records.encounters.length,
    },
    records,
    source: params.source || 'database',
  };
}
