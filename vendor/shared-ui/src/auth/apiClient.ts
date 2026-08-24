import type { ApiProbeResult, AuthSession, BackendAuthConfig } from './types';
import { authHeaders, getApiBase } from './session';

export async function fetchBackendAuthConfig(): Promise<BackendAuthConfig> {
  const res = await fetch(`${getApiBase()}/dev/auth/config`);
  if (!res.ok) {
    throw new Error(`Failed to load auth config (${res.status})`);
  }
  return res.json() as Promise<BackendAuthConfig>;
}

export async function mintDevToken(
  input: Pick<AuthSession, 'sub' | 'scope' | 'purpose'> & { expiresIn?: string },
): Promise<string> {
  const res = await fetch(`${getApiBase()}/dev/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sub: input.sub,
      scope: input.scope,
      purposeOfUse: input.purpose,
      expiresIn: input.expiresIn || '1h',
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Token mint failed (${res.status})`);
  }
  const data = (await res.json()) as { token: string };
  return data.token;
}

export async function apiFetch(
  path: string,
  session: AuthSession | null,
  init: RequestInit = {},
): Promise<Response> {
  const headers = authHeaders(session, {
    ...(init.headers as Record<string, string> | undefined),
  });
  return fetch(`${getApiBase()}${path}`, { ...init, headers });
}

export async function probeApi(
  path: string,
  session: AuthSession | null,
  method = 'GET',
  body?: unknown,
): Promise<ApiProbeResult> {
  const headers = authHeaders(session, {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
  });
  const res = await fetch(`${getApiBase()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let parsed: unknown;
  const text = await res.text();
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { ok: res.ok, status: res.status, body: parsed, path, method };
}
