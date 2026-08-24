import type { AuthSession, PortalKind } from './types';
import { PORTAL_PRESETS, STORAGE_KEY } from './types';

export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}

export function defaultSession(portal: PortalKind): AuthSession {
  const preset = PORTAL_PRESETS[portal];
  const envToken = process.env.NEXT_PUBLIC_API_TOKEN;
  const jwksEnabled = process.env.NEXT_PUBLIC_AUTH_JWKS_ENABLED === 'true';

  return {
    token: envToken || (jwksEnabled ? '' : 'dev-token'),
    mode: envToken ? 'external' : jwksEnabled ? 'jwt' : 'stub',
    scope: preset.scope,
    purpose: 'RESRCH',
    sub: preset.sub,
    role: preset.role,
    patientId: 'EP-DEMO-001',
    organizationRef: 'Organization/trialcliniq',
  };
}

export function loadSession(portal: PortalKind): AuthSession {
  if (typeof window === 'undefined') return defaultSession(portal);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSession(portal);
    return { ...defaultSession(portal), ...JSON.parse(raw) } as AuthSession;
  } catch {
    return defaultSession(portal);
  }
}

export function saveSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function authHeaders(
  session: AuthSession | null,
  extra: Record<string, string> = {},
): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }
  if (session?.purpose) {
    headers['x-purpose-of-use'] = session.purpose;
  }
  if (session?.mode === 'stub' && session.scope) {
    headers['x-fhir-scope'] = session.scope;
  }
  if (session?.role) {
    headers['x-user-role'] = session.role;
  }
  if (session?.patientId) {
    headers['x-patient-id'] = session.patientId;
  }
  if (session?.organizationRef) {
    headers['x-organization-ref'] = session.organizationRef;
  }
  return headers;
}
