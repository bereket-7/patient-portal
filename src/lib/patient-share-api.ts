import type { AuthSession } from '@trialcliniq/shared-ui';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type SharePermission =
  | 'ALL'
  | 'MEDICATIONS'
  | 'ALLERGIES'
  | 'CONDITIONS'
  | 'RECENT_LABS';

export type PatientShareSession = {
  status: 'created' | 'active' | 'none';
  token?: string;
  otp?: string;
  share_url?: string;
  expires_at?: string;
  verified?: boolean;
  qr_payload?: string;
  permission_scope?: SharePermission;
};

export type SharedPatientPayload = {
  patient_id: string;
  display_name: string;
  date_of_birth?: string;
  email_masked: string;
  phone_masked?: string;
  enterprise_patient_id?: string;
  health_ex_patient_id?: string;
  conditions: string[];
  medications: string[];
  allergies: string[];
  last_updated: string;
  permission_scope?: SharePermission;
};

export type ShareAuditEvent = {
  audit_id: string;
  token_id: string;
  action: string;
  provider_id?: string;
  created_at: string;
  resources_accessed?: unknown;
};

async function shareFetch<T>(
  path: string,
  init?: RequestInit,
  session?: AuthSession | null,
): Promise<{ ok: boolean; data: T | null; error: string | null }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string> | undefined),
    };
    if (session?.token) {
      headers.Authorization = `Bearer ${session.token}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        data: null,
        error: (body as { error?: string } | null)?.error || `http_${res.status}`,
      };
    }
    return { ok: true, data: body as T, error: null };
  } catch {
    return { ok: false, data: null, error: 'network_error' };
  }
}

export function resolveShareUrl(session: Pick<PatientShareSession, 'token' | 'share_url'>): string {
  if (typeof window !== 'undefined' && session.token) {
    return `${window.location.origin}/share/${session.token}`;
  }
  return session.share_url || (session.token ? `/share/${session.token}` : '');
}

export async function createPatientShareSession(
  input: {
    email: string;
    patient_id?: string;
    account_id?: string;
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    phone?: string;
    enterprise_patient_id?: string;
    health_ex_patient_id?: string;
    consent_reference_id?: string;
    permission?: SharePermission;
    conditions?: string[];
    medications?: string[];
    allergies?: string[];
  },
  session?: AuthSession | null,
): Promise<{ session: PatientShareSession | null; error: string | null }> {
  const result = await shareFetch<PatientShareSession>(
    '/api/v1/share/sessions',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    session,
  );
  return { session: result.ok ? result.data : null, error: result.error };
}

export async function getCurrentPatientShareSession(
  email: string,
  session?: AuthSession | null,
  accountId?: string,
): Promise<PatientShareSession | null> {
  const result = await shareFetch<PatientShareSession>(
    '/api/v1/share/sessions/current',
    {
      method: 'POST',
      body: JSON.stringify({ email, account_id: accountId }),
    },
    session,
  );
  return result.ok ? result.data : null;
}

export async function revokePatientShareSession(
  email: string,
  session?: AuthSession | null,
  accountId?: string,
): Promise<boolean> {
  const result = await shareFetch<{ status: string }>(
    '/api/v1/share/sessions/revoke',
    {
      method: 'POST',
      body: JSON.stringify({ email, account_id: accountId }),
    },
    session,
  );
  return result.ok;
}

export async function fetchShareAudit(
  session: AuthSession,
  patientId: string,
): Promise<ShareAuditEvent[]> {
  const result = await shareFetch<{ events: ShareAuditEvent[] }>(
    `/api/v1/share/audit?patient_id=${encodeURIComponent(patientId)}`,
    { method: 'GET' },
    session,
  );
  return result.ok ? result.data?.events || [] : [];
}

export async function fetchShareSessionPublic(token: string): Promise<{
  valid: boolean;
  expired: boolean;
  patient_initials?: string;
  expires_at?: string;
} | null> {
  const result = await shareFetch<{
    valid: boolean;
    expired: boolean;
    patient_initials?: string;
    expires_at?: string;
  }>(`/api/v1/share/sessions/${encodeURIComponent(token)}`);
  return result.ok ? result.data : null;
}

export async function verifyShareOtp(
  token: string,
  otp: string,
): Promise<{ ok: true; patient: SharedPatientPayload } | { ok: false; error: string }> {
  const result = await shareFetch<{ status: string; patient: SharedPatientPayload }>(
    `/api/v1/share/sessions/${encodeURIComponent(token)}/verify`,
    { method: 'POST', body: JSON.stringify({ otp }) },
  );
  if (result.ok && result.data?.patient) {
    return { ok: true as const, patient: result.data.patient };
  }
  return { ok: false as const, error: result.error || 'verify_failed' };
}
