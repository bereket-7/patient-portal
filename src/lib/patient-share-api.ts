const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type PatientShareSession = {
  status: 'created' | 'active' | 'none';
  token?: string;
  otp?: string;
  share_url?: string;
  expires_at?: string;
  verified?: boolean;
  qr_payload?: string;
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
};

async function shareFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string> | undefined),
      },
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

export async function createPatientShareSession(input: {
  email: string;
  patient_id?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  phone?: string;
  enterprise_patient_id?: string;
  health_ex_patient_id?: string;
  conditions?: string[];
  medications?: string[];
  allergies?: string[];
}): Promise<{ session: PatientShareSession | null; error: string | null }> {
  const result = await shareFetch<PatientShareSession>('/dev/patient-share/sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return { session: result.ok ? result.data : null, error: result.error };
}

export async function getCurrentPatientShareSession(
  email: string,
): Promise<PatientShareSession | null> {
  const result = await shareFetch<PatientShareSession>('/dev/patient-share/sessions/current', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return result.ok ? result.data : null;
}

export async function revokePatientShareSession(email: string): Promise<boolean> {
  const result = await shareFetch<{ status: string }>('/dev/patient-share/sessions/revoke', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return result.ok;
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
  }>(`/dev/patient-share/sessions/${encodeURIComponent(token)}`);
  return result.ok ? result.data : null;
}

export async function verifyShareOtp(
  token: string,
  otp: string,
): Promise<{ ok: true; patient: SharedPatientPayload } | { ok: false; error: string }> {
  const result = await shareFetch<{ status: string; patient: SharedPatientPayload }>(
    `/dev/patient-share/sessions/${encodeURIComponent(token)}/verify`,
    { method: 'POST', body: JSON.stringify({ otp }) },
  );
  if (result.ok && result.data?.patient) {
    return { ok: true as const, patient: result.data.patient };
  }
  return { ok: false as const, error: result.error || 'verify_failed' };
}
