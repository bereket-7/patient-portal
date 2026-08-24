import { apiFetch, apiPost, type AuthSession } from '@trialcliniq/shared-ui';
import type { PatientAccount } from '@/lib/types/patient-account';
import type { AccessLogEntry, AccessLogEventType } from '@/lib/mock/access-log';

const DEFAULT_ORG = 'Organization/trialcliniq';

export function resolvePatientApiId(account: PatientAccount, session: AuthSession): string {
  return account.enterprisePatientId || session.patientId || account.id;
}

type BackendAuditEvent = {
  event_id: string;
  user_id: string;
  patient_id: string;
  event_type: string;
  action: string;
  outcome: string;
  created_at: string;
  payload?: Record<string, unknown>;
};

function mapAuditEventType(eventType: string): AccessLogEventType {
  switch (eventType) {
    case 'patient_record_access':
    case 'consent_validation':
    case 'phi_access':
    case 'api_request':
    case 'consent_violation':
      return eventType;
    default:
      return 'api_request';
  }
}

export function mapBackendAuditEvent(event: BackendAuditEvent): AccessLogEntry {
  const payload = event.payload || {};
  return {
    id: event.event_id,
    eventType: mapAuditEventType(event.event_type),
    actor: (payload.actor as string) || event.user_id || 'System',
    organization: (payload.organization as string) || 'TrialClinIQ',
    action: event.action,
    purpose: (payload.purpose as string) || 'RESRCH',
    outcome: event.outcome?.toUpperCase() === 'SUCCESS' ? 'SUCCESS' : 'FAILURE',
    timestamp: event.created_at,
  };
}

export type ConsentCaptureResult = {
  status: string;
  consent_id?: string;
  consent_reference_id?: string;
  consent?: { consent_id?: string };
};

export async function captureHealthExConsent(
  session: AuthSession,
  params: {
    patientId: string;
    consentReferenceId: string;
    organizationRef?: string;
    purpose?: string;
  },
): Promise<ConsentCaptureResult> {
  const result = await apiPost<ConsentCaptureResult>(
    '/api/v1/consent/capture-from-healthex',
    session,
    {
      patientId: params.patientId,
      consentReferenceId: params.consentReferenceId,
      organizationRef: params.organizationRef || DEFAULT_ORG,
      purpose: params.purpose || session.purpose || 'RESRCH',
    },
  );
  if (!result.ok || !result.data) {
    throw new Error(result.error || 'consent_capture_failed');
  }
  return result.data;
}

export async function getActiveConsent(
  session: AuthSession,
  patientId: string,
): Promise<(Record<string, unknown> & { consent_id?: string }) | null> {
  const res = await apiFetch(`/api/v1/consent/${encodeURIComponent(patientId)}`, session);
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `consent_fetch_failed_${res.status}`);
  }
  return (await res.json()) as Record<string, unknown> & { consent_id?: string };
}

export async function revokeBackendConsent(
  session: AuthSession,
  consentId: string,
  patientId: string,
  reason?: string,
): Promise<void> {
  const res = await apiFetch(`/api/v1/consent/${encodeURIComponent(consentId)}`, session, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, reason }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `consent_revoke_failed_${res.status}`);
  }
}

export type PatientIdentityLinkResult = {
  enterprise_patient_id: string;
  external_patient_id: string;
  source_system: string;
  created_at: string;
};

export async function fetchPatientIdentity(
  session: AuthSession,
  enterpriseId: string,
): Promise<PatientIdentityLinkResult | null> {
  const res = await apiFetch(
    `/api/v1/patient-identity/${encodeURIComponent(enterpriseId)}`,
    session,
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `patient_identity_fetch_failed_${res.status}`);
  }
  return (await res.json()) as PatientIdentityLinkResult;
}

export async function linkPatientIdentity(
  session: AuthSession,
  params: {
    healthexPatientId: string;
    externalPatientId?: string;
  },
): Promise<PatientIdentityLinkResult> {
  const result = await apiPost<PatientIdentityLinkResult>(
    '/api/v1/patient-identity',
    session,
    {
      external_patient_id: params.externalPatientId || params.healthexPatientId,
      healthex_patient_id: params.healthexPatientId,
      source_system: 'HealthX',
    },
  );
  if (!result.ok || !result.data) {
    throw new Error(result.error || 'patient_identity_link_failed');
  }
  return result.data;
}

export async function fetchPatientAuditLog(
  session: AuthSession,
  patientId: string,
  limit = 50,
): Promise<AccessLogEntry[]> {
  const res = await apiFetch(
    `/api/v1/audit?patient_id=${encodeURIComponent(patientId)}&limit=${limit}`,
    session,
  );
  if (res.status === 503) {
    throw new Error('audit_store_unavailable');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `audit_fetch_failed_${res.status}`);
  }
  const data = (await res.json()) as { events?: BackendAuditEvent[] };
  return (data.events || []).map(mapBackendAuditEvent);
}

export function shouldUseBackendApis(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== 'true';
}

export type PatientClinicalProfile = {
  enterprise_id: string;
  patient_id: string;
  age?: number;
  diagnoses: string[];
  medications: string[];
  procedures: Array<{ code: string; date?: string }>;
  observations: Array<{ code?: string; display?: string; abnormal?: boolean; value?: string; date?: string }>;
  encounters: Array<{
    id?: string;
    date?: string;
    type?: string;
    status?: string;
    facility?: string;
    provider?: string;
    reason?: string;
    class?: string;
    classCode?: string;
  }>;
  last_encounter_at?: string;
  risk_factors: string[];
  updated_at: string;
  portal_snapshot?: Record<string, unknown> | null;
  healthex_reference_id?: string | null;
};

export async function fetchPatientClinicalProfile(
  session: AuthSession,
  enterpriseId: string,
): Promise<PatientClinicalProfile | null> {
  const res = await apiFetch(
    `/api/v1/reports/patient-profile/${encodeURIComponent(enterpriseId)}`,
    session,
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `profile_fetch_failed_${res.status}`);
  }
  const data = (await res.json()) as PatientClinicalProfile | { error?: string };
  if ('error' in data && data.error) return null;
  return data as PatientClinicalProfile;
}

export type EligibilityMatchResult = {
  trial_id: string;
  patient_id: string;
  eligible: boolean;
  score: number;
  rule_results: Array<{ rule_type: string; passed: boolean; description?: string }>;
  match_id?: string;
  status?: string;
};

export async function evaluateTrialEligibility(
  session: AuthSession,
  params: {
    patientId: string;
    enterpriseId?: string;
    profile: {
      age?: number;
      diagnoses?: string[];
      medications?: string[];
      procedures?: Array<{ code: string; date?: string }>;
      state?: string;
    };
  },
): Promise<{ matches: EligibilityMatchResult[]; reviews?: Array<{ match_id?: string; status?: string }> }> {
  const result = await apiPost<{
    matches: EligibilityMatchResult[];
    reviews?: Array<{ match_id?: string; status?: string }>;
  }>('/api/v1/eligibility/evaluate', session, {
    patient_id: params.patientId,
    enterprise_id: params.enterpriseId,
    create_review: true,
    profile: params.profile,
  });
  if (!result.ok || !result.data) {
    throw new Error(result.error || 'eligibility_evaluate_failed');
  }
  return result.data;
}
