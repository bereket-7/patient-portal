import { apiFetch, type AuthSession } from '@trialcliniq/shared-ui';
import type {
  ConditionRecord,
  EncounterRecord,
  HealthRecords,
  MedicationRecord,
  ObservationRecord,
  VitalMetric,
} from '@/lib/types/health-records';
import { EMPTY_HEALTH_RECORDS } from '@/lib/mock/health-records';

export type HealthExClinicalSummary = {
  available: boolean;
  reason?: string;
  resource_counts: Record<string, number>;
  total_resources: number;
  demographics?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    birth_date?: string;
    gender?: string;
  };
  conditions: Array<{ code?: string; display?: string; onset?: string }>;
  medications: Array<{ name?: string; status?: string }>;
  observations: Array<{ display?: string; value?: string; date?: string; status?: string }>;
  encounters: Array<{
    id?: string;
    type?: string;
    date?: string;
    status?: string;
    facility?: string;
    provider?: string;
    reason?: string;
    class?: string;
  }>;
  allergies?: Array<{ display?: string }>;
};

export type HealthExPatientDetail = {
  patient: {
    reference_id: string;
    patient_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    date_of_birth?: string | null;
  };
  consent: {
    status: string;
    retrieval_status?: string | null;
  };
  clinical: HealthExClinicalSummary;
};

/** Cached clinical snapshot stored on the patient account after consent fetch. */
export type CachedClinicalRecords = {
  fetchedAt: string;
  referenceId: string;
  patientId?: string;
  consentStatus?: string;
  retrievalStatus?: string;
  rawUri?: string;
  transactionId?: string;
  resourceCounts?: Record<string, number>;
  records: HealthRecords;
  /** Where this snapshot was loaded from (live ingest, postgres, or dev dummy). */
  source?: 'live' | 'database' | 'dummy';
  processingStatus?: 'PENDING' | 'READY' | 'PARTIAL' | 'FAILED';
  qualityScore?: number | null;
  issues?: string[];
  errors?: Array<{ stage: string; reason: string; resource_type?: string; at?: string }>;
  integrityHash?: string | null;
};

function severityFromName(name: string): ConditionRecord['severity'] {
  const lower = name.toLowerCase();
  if (lower.includes('severe') || lower.includes('acute')) return 'Severe';
  if (lower.includes('moderate') || lower.includes('chronic')) return 'Moderate';
  if (lower.includes('complaint') || lower.includes('symptom')) return 'Complaint';
  return 'Mild';
}

export function mapClinicalToHealthRecords(clinical: HealthExClinicalSummary): HealthRecords {
  const conditions: ConditionRecord[] = (clinical.conditions || []).map((c, i) => {
    const name = c.display || c.code || 'Condition';
    return {
      id: `cond-${i}`,
      name,
      period: c.onset || '—',
      severity: severityFromName(name),
    };
  });

  const medications: MedicationRecord[] = (clinical.medications || []).map((m, i) => ({
    id: `med-${i}`,
    name: m.name || 'Medication',
    dosage: '—',
    status: m.status
      ? m.status.charAt(0).toUpperCase() + m.status.slice(1)
      : 'Active',
    prescribedDate: '—',
  }));

  const observations: ObservationRecord[] = (clinical.observations || []).map((o, i) => ({
    id: `obs-${i}`,
    name: o.display || 'Observation',
    value: o.value || '—',
    date: o.date || '—',
    status: o.status
      ? o.status.charAt(0).toUpperCase() + o.status.slice(1)
      : 'Final',
  }));

  const vitals: VitalMetric[] = observations
    .filter((o) =>
      /blood pressure|heart rate|bmi|weight|spo2|glucose|temperature|pulse/i.test(o.name),
    )
    .slice(0, 6)
    .map((o, i) => {
      const parts = String(o.value).split(/\s+/);
      return {
        id: `vital-${i}`,
        label: o.name,
        value: parts[0] || o.value,
        unit: parts.slice(1).join(' ') || '',
        date: o.date,
        color: 'bg-muted',
      };
    });

  const encounters: EncounterRecord[] = (clinical.encounters || []).map((e, i) => ({
    id: e.id || `enc-${i}`,
    type: e.type || 'Visit',
    date: e.date || '—',
    status: e.status || 'finished',
    facility: e.facility,
    provider: e.provider,
    reason: e.reason,
    classCode: e.class,
  }));

  const cholesterol = observations
    .filter((o) => /hdl|cholesterol/i.test(o.name))
    .slice(0, 5)
    .map((o, i) => {
      const num = parseFloat(String(o.value).replace(/[^\d.]/g, ''));
      return {
        year: o.date?.slice(0, 4) || String(2020 + i),
        value: Number.isFinite(num) ? num : 45 + i * 3,
        inRange: Number.isFinite(num) ? num >= 40 : true,
      };
    });

  const imagingEncounter = encounters.find((e) =>
    /x-ray|imaging|radiology|scan/i.test(`${e.type} ${e.reason || ''}`),
  );

  return {
    ...EMPTY_HEALTH_RECORDS,
    vitals,
    conditions,
    medications,
    observations,
    encounters,
    cholesterol:
      cholesterol.length > 0
        ? cholesterol
        : EMPTY_HEALTH_RECORDS.cholesterol,
    lastScan: imagingEncounter
      ? {
          title: imagingEncounter.reason || imagingEncounter.type,
          facility: imagingEncounter.facility || '—',
          address: '—',
          date: imagingEncounter.date,
        }
      : EMPTY_HEALTH_RECORDS.lastScan,
    allergies: (clinical.allergies || [])
      .map((a) => a.display || '')
      .filter(Boolean),
  };
}

export async function fetchHealthExClinicalDetail(
  session: AuthSession,
  referenceId: string,
): Promise<HealthExPatientDetail> {
  const res = await apiFetch(
    `/api/v1/healthex/patients/${encodeURIComponent(referenceId)}?include_clinical=true`,
    session,
  );
  const body = await res.json().catch(() => null);
  if (!res.ok || !body) {
    throw new Error(
      (body as { error?: string } | null)?.error || `clinical_fetch_failed_${res.status}`,
    );
  }
  return body as HealthExPatientDetail;
}

export async function loadAndCacheClinicalRecords(params: {
  session: AuthSession;
  referenceId: string;
  rawUri?: string;
  transactionId?: string;
  /** When ingest already returned a clinical summary, skip duplicate $everything fetch. */
  ingestClinical?: HealthExClinicalSummary;
}): Promise<CachedClinicalRecords> {
  if (params.ingestClinical?.available) {
    const records = mapClinicalToHealthRecords(params.ingestClinical);
    return {
      fetchedAt: new Date().toISOString(),
      referenceId: params.referenceId,
      consentStatus: undefined,
      retrievalStatus: undefined,
      rawUri: params.rawUri,
      transactionId: params.transactionId,
      resourceCounts: params.ingestClinical.resource_counts,
      records,
    };
  }

  const detail = await fetchHealthExClinicalDetail(params.session, params.referenceId);
  const records = detail.clinical?.available
    ? mapClinicalToHealthRecords(detail.clinical)
    : EMPTY_HEALTH_RECORDS;

  return {
    fetchedAt: new Date().toISOString(),
    referenceId: params.referenceId,
    patientId: detail.patient?.patient_id || undefined,
    consentStatus: detail.consent?.status,
    retrievalStatus: detail.consent?.retrieval_status || undefined,
    rawUri: params.rawUri,
    transactionId: params.transactionId,
    resourceCounts: detail.clinical?.resource_counts,
    records,
  };
}
