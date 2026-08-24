'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { apiFetch } from '../auth/apiClient';

export function useApi<T>(path: string, fallback: T): { data: T; loading: boolean; error: string | null } {
  const { session } = useAuth();
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const sessionKey = `${session.token}|${session.scope}|${session.patientId}|${session.mode}|${session.role}`;

  useEffect(() => {
    if (demoMode) {
      setData(fallbackRef.current);
      setLoading(false);
      setError(null);
      return;
    }

    if (!session.token && process.env.NEXT_PUBLIC_AUTH_JWKS_ENABLED === 'true') {
      setData(fallbackRef.current);
      setLoading(false);
      setError('missing_token');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    apiFetch(path, session)
      .then(async (r) => {
        if (cancelled) return;
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          setError((body as { error?: string }).error || `http_${r.status}`);
          setData(fallbackRef.current);
          return;
        }
        setData(await r.json());
      })
      .catch(() => {
        if (!cancelled) {
          setError('network_error');
          setData(fallbackRef.current);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path, sessionKey, demoMode, session]);

  return { data, loading, error };
}

export async function apiPost<T>(
  path: string,
  session: Parameters<typeof apiFetch>[1],
  body: unknown,
): Promise<{ ok: boolean; status: number; data: T | null; error: string | null }> {
  const res = await apiFetch(path, session, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const parsed = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      data: null,
      error: (parsed as { error?: string } | null)?.error || `http_${res.status}`,
    };
  }
  return { ok: true, status: res.status, data: parsed as T, error: null };
}
