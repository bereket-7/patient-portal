/** HealthEx OAuth / wallet redirect — TrialClinIQ never stores HealthEx credentials. */

import type { AuthSession } from '@trialcliniq/shared-ui';
import type { HealthExClinicalSummary } from '@/lib/healthex-clinical';
import {
  generateCodeChallenge,
  generateCodeVerifier,
  HEALTHEX_OAUTH_STATE_KEY,
  HEALTHEX_OAUTH_VERIFIER_KEY,
} from '@/lib/healthex-oauth-pkce';

const HEALTHEX_AUTH_URL =
  process.env.NEXT_PUBLIC_HEALTHEX_AUTH_URL || 'https://wallet.healthex.io/oauth/authorize';
const HEALTHEX_CLIENT_ID = process.env.NEXT_PUBLIC_HEALTHEX_CLIENT_ID || 'trialcliniq-dev';
const CALLBACK_PATH = '/connect/healthex/callback';

export function getHealthExCallbackUrl(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${CALLBACK_PATH}`;
}

export async function prepareHealthExOAuthState(patientId: string): Promise<string> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = btoa(JSON.stringify({ patientId, ts: Date.now() }));
  sessionStorage.setItem(HEALTHEX_OAUTH_VERIFIER_KEY, verifier);
  sessionStorage.setItem(HEALTHEX_OAUTH_STATE_KEY, state);
  sessionStorage.setItem('healthex_oauth_pkce_challenge', challenge);
  return state;
}

export function buildHealthExAuthorizeUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: HEALTHEX_CLIENT_ID,
    response_type: 'code',
    redirect_uri: getHealthExCallbackUrl(),
    scope: 'patient/*.read openid offline_access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${HEALTHEX_AUTH_URL}?${params.toString()}`;
}

export function isHealthExOAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_HEALTHEX_AUTH_URL);
}

export type HealthExFetchResult = {
  status: string;
  transaction_id: string;
  raw_uri?: string;
  resource_counts?: Record<string, number>;
  clinical?: HealthExClinicalSummary;
};

export async function triggerHealthExFetch(params: {
  healthexPatientId: string;
  accessToken?: string;
  consentReferenceId: string;
  apiBase?: string;
  /** Gateway bearer from AuthProvider session (preferred). */
  authToken?: string;
  session?: AuthSession | null;
  /** When set, ingestion upserts clinical summary into Postgres for this member. */
  enterprisePatientId?: string;
}): Promise<HealthExFetchResult> {
  const base = params.apiBase || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const bearer = params.authToken || params.session?.token || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: bearer ? `Bearer ${bearer}` : '',
    'x-patient-id': params.healthexPatientId,
    'x-consent-reference-id': params.consentReferenceId,
    'x-purpose-of-use': params.session?.purpose || 'RESRCH',
  };
  if (params.enterprisePatientId) {
    headers['x-enterprise-patient-id'] = params.enterprisePatientId;
  }
  if (params.session?.role) {
    headers['x-user-role'] = params.session.role;
  }
  if (params.session?.organizationRef) {
    headers['x-organization-ref'] = params.session.organizationRef;
  }
  if (params.session?.mode === 'stub' && params.session.scope) {
    headers['x-fhir-scope'] = params.session.scope;
  }

  const res = await fetch(`${base}/api/v1/ingest/HealthX/fetch`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      healthex_patient_id: params.healthexPatientId,
      access_token: params.accessToken || '',
      consent_reference_id: params.consentReferenceId,
      enterprise_id: params.enterprisePatientId || undefined,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `fetch_failed_${res.status}`);
  }

  return (await res.json()) as HealthExFetchResult;
}
