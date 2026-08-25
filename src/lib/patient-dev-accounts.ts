import type { PatientAccount } from '@/lib/types/patient-account';
import { loadAccount, saveAccount } from '@/lib/mock/patient-account-store';
import { PATIENT_ACCOUNTS_API_BASE } from '@/lib/patient-accounts-api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type DevPatientAccount = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  gender?: string;
  address?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  enterprisePatientId?: string;
  healthExReferenceId?: string;
  healthExPatientId?: string;
  consentReferenceId?: string;
  healthexConsentStatus?: string;
  healthexRetrievalStatus?: string;
  healthexLinkError?: string;
};

export type DevSeedAccount = DevPatientAccount & {
  password: string;
  readyToLogin: boolean;
};

export type RegisterDevResult = {
  account: DevPatientAccount;
  healthexLinked: boolean;
  healthexError?: string;
  referenceId?: string;
};

async function devFetch<T>(
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
      const errBody = body as { error?: string; detail?: string; message?: unknown } | null;
      const nested =
        errBody?.message && typeof errBody.message === 'object'
          ? (errBody.message as { error?: string; detail?: string })
          : null;
      const code = nested?.error || errBody?.error;
      const detail = nested?.detail || errBody?.detail;
      const message = [code, detail].filter(Boolean).join(': ');
      return {
        ok: false,
        data: null,
        error: message || `http_${res.status}`,
      };
    }
    return { ok: true, data: body as T, error: null };
  } catch {
    return { ok: false, data: null, error: 'network_error' };
  }
}

export function mapDevAccountToPatientAccount(
  dev: DevPatientAccount,
  password: string,
  patch: Partial<PatientAccount> = {},
): PatientAccount {
  return {
    id: dev.id,
    firstName: dev.firstName,
    lastName: dev.lastName,
    dateOfBirth: dev.dateOfBirth,
    email: dev.email,
    phone: dev.phone,
    passwordHash: password,
    gender: dev.gender,
    address: dev.address,
    emailVerified: dev.emailVerified,
    phoneVerified: dev.phoneVerified,
    enterprisePatientId: dev.enterprisePatientId,
    healthExReferenceId: dev.healthExReferenceId,
    healthExPatientId: dev.healthExPatientId,
    consentReferenceId: dev.consentReferenceId,
    healthexConsentStatus: dev.healthexConsentStatus,
    healthexRetrievalStatus: dev.healthexRetrievalStatus,
    healthexLinkError: dev.healthexLinkError,
    isLoggedIn: false,
    healthExConnected: Boolean(dev.healthExReferenceId || dev.healthExPatientId),
    consentStatus: 'none',
    ...patch,
  };
}

export function syncDevAccountToLocal(dev: DevPatientAccount, password: string): PatientAccount {
  const existing = typeof window !== 'undefined' ? loadAccount() : null;
  const base = mapDevAccountToPatientAccount(dev, password);
  const account =
    existing && existing.email === dev.email
      ? {
          ...base,
          consentStatus: existing.consentStatus,
          clinicalCache: existing.clinicalCache,
          backendConsentId: existing.backendConsentId ?? base.backendConsentId,
          consentGrantedAt: existing.consentGrantedAt,
          consentRevokedAt: existing.consentRevokedAt,
          lastIngestAt: existing.lastIngestAt,
          lastIngestRawUri: existing.lastIngestRawUri,
        }
      : base;
  saveAccount(account);
  return account;
}

export async function fetchSeedPatientAccounts(): Promise<DevSeedAccount[]> {
  const result = await devFetch<{ accounts: DevSeedAccount[] }>(`${PATIENT_ACCOUNTS_API_BASE}/seed`);
  if (!result.ok || !result.data?.accounts) return [];
  return result.data.accounts;
}

export async function registerDevPatientAccount(input: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  password: string;
  gender?: string;
  address?: string;
}): Promise<RegisterDevResult | null> {
  const result = await devFetch<{
    account: DevPatientAccount;
    healthex?: { linked?: boolean; error?: string; reference_id?: string };
    healthex_link_error?: string;
  }>(`${PATIENT_ACCOUNTS_API_BASE}/register`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!result.ok || !result.data?.account) return null;
  return {
    account: result.data.account,
    healthexLinked: result.data.healthex?.linked === true,
    healthexError: result.data.healthex_link_error || result.data.healthex?.error,
    referenceId: result.data.healthex?.reference_id,
  };
}

export async function loginDevPatientAccount(
  email: string,
  password: string,
): Promise<DevPatientAccount | null> {
  const result = await devFetch<{ account: DevPatientAccount }>(`${PATIENT_ACCOUNTS_API_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!result.ok || !result.data?.account) return null;
  return result.data.account;
}

export async function verifyDevPatientEmail(email: string): Promise<DevPatientAccount | null> {
  const result = await devFetch<{ account: DevPatientAccount }>(`${PATIENT_ACCOUNTS_API_BASE}/verify-email`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (!result.ok || !result.data?.account) return null;
  return result.data.account;
}

export async function verifyDevPatientPhone(email: string): Promise<DevPatientAccount | null> {
  const result = await devFetch<{ account: DevPatientAccount }>(`${PATIENT_ACCOUNTS_API_BASE}/verify-phone`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (!result.ok || !result.data?.account) return null;
  return result.data.account;
}

export async function retryHealthExLink(email: string): Promise<{
  account: DevPatientAccount | null;
  linked: boolean;
  error: string | null;
}> {
  const result = await devFetch<{
    account: DevPatientAccount;
    healthex?: { linked?: boolean; error?: string };
    healthex_link_error?: string;
  }>(`${PATIENT_ACCOUNTS_API_BASE}/retry-healthex-link`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (!result.ok || !result.data?.account) {
    return { account: null, linked: false, error: result.error };
  }
  return {
    account: result.data.account,
    linked: result.data.healthex?.linked === true || Boolean(result.data.account.healthExReferenceId),
    error: result.data.healthex_link_error || result.data.healthex?.error || null,
  };
}

export async function syncHealthExStatus(email: string): Promise<{
  account: DevPatientAccount | null;
  error: string | null;
  healthex?: {
    consent_status?: string | null;
    retrieval_status?: string | null;
    patient_id?: string | null;
    reference_id?: string;
    consent_reference_id?: string | null;
  };
}> {
  const result = await devFetch<{
    account: DevPatientAccount;
    healthex?: {
      consent_status?: string | null;
      retrieval_status?: string | null;
      patient_id?: string | null;
      reference_id?: string;
    };
  }>(`${PATIENT_ACCOUNTS_API_BASE}/sync-healthex`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (!result.ok || !result.data?.account) {
    return { account: null, error: result.error };
  }
  return { account: result.data.account, error: null, healthex: result.data.healthex };
}

export async function loadDevClinicalProfile(email: string): Promise<{
  profile: Record<string, unknown> | null;
  portalSnapshot: Record<string, unknown> | null;
  account: DevPatientAccount | null;
  error: string | null;
}> {
  const result = await devFetch<{
    status: string;
    account: DevPatientAccount;
    profile: Record<string, unknown> | null;
    portal_snapshot?: Record<string, unknown> | null;
  }>(`${PATIENT_ACCOUNTS_API_BASE}/load-clinical-profile`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (!result.ok) {
    return { profile: null, portalSnapshot: null, account: null, error: result.error };
  }
  return {
    profile: result.data?.profile ?? null,
    portalSnapshot: result.data?.portal_snapshot ?? null,
    account: result.data?.account ?? null,
    error: null,
  };
}

export async function seedDevDummyClinical(email: string): Promise<{
  profile: Record<string, unknown> | null;
  account: DevPatientAccount | null;
  error: string | null;
}> {
  const result = await devFetch<{
    status: string;
    account: DevPatientAccount;
    profile: Record<string, unknown> | null;
  }>(`${PATIENT_ACCOUNTS_API_BASE}/seed-dummy-clinical`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (!result.ok) {
    return { profile: null, account: null, error: result.error };
  }
  return {
    profile: result.data?.profile ?? null,
    account: result.data?.account ?? null,
    error: null,
  };
}

/** Persist HealthEx clinical summary into Postgres for durable patient portal reloads. */
export async function persistDevClinicalProfile(
  email: string,
  clinical?: Record<string, unknown>,
  options?: { portalSnapshot?: Record<string, unknown>; rawUri?: string; forceFetch?: boolean },
): Promise<{
  profile: Record<string, unknown> | null;
  portalSnapshot: Record<string, unknown> | null;
  account: DevPatientAccount | null;
  enterprisePatientId: string | null;
  error: string | null;
}> {
  const result = await devFetch<{
    status: string;
    account: DevPatientAccount;
    profile: Record<string, unknown> | null;
    portal_snapshot?: Record<string, unknown> | null;
    enterprise_patient_id?: string;
  }>(`${PATIENT_ACCOUNTS_API_BASE}/persist-clinical-profile`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      clinical,
      portal_snapshot: options?.portalSnapshot,
      raw_uri: options?.rawUri,
      force_fetch: options?.forceFetch ?? (!clinical && !options?.portalSnapshot),
    }),
  });
  if (!result.ok) {
    return {
      profile: null,
      portalSnapshot: null,
      account: null,
      enterprisePatientId: null,
      error: result.error,
    };
  }
  return {
    profile: result.data?.profile ?? null,
    portalSnapshot: result.data?.portal_snapshot ?? null,
    account: result.data?.account ?? null,
    enterprisePatientId: result.data?.enterprise_patient_id ?? null,
    error: null,
  };
}

export async function exchangeHealthExOAuthCode(input: {
  email: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<{
  account: DevPatientAccount | null;
  error: string | null;
  oauth?: { connected?: boolean; expires_at?: string; has_health_ex_link?: boolean };
}> {
  const result = await devFetch<{
    account: DevPatientAccount;
    oauth?: { connected?: boolean; expires_at?: string; has_health_ex_link?: boolean };
  }>(`${PATIENT_ACCOUNTS_API_BASE}/healthex-oauth/exchange`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!result.ok || !result.data?.account) {
    return { account: null, error: result.error };
  }
  return {
    account: result.data.account,
    error: null,
    oauth: result.data.oauth,
  };
}
