'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { accessShareToken } from '@/lib/mock/share-store';
import { getSharedPatientDetail } from '@/lib/share-summary';
import { sharePermissionLabel, type ShareTokenPayload } from '@/lib/types/share';
import type { SharedPatientDetail } from '@/lib/share-summary';
import { isShareVerified, ShareAccessGate } from '@/components/share/share-access-gate';

type ViewState =
  | { status: 'loading' }
  | { status: 'ok'; payload: ShareTokenPayload }
  | { status: 'error'; reason: 'invalid' | 'expired' | 'revoked' };

function formatExpiry(exp: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(exp));
  } catch {
    return new Date(exp).toISOString();
  }
}

export function useShareAccess(token: string) {
  const [state, setState] = useState<ViewState>({ status: 'loading' });

  useEffect(() => {
    const result = accessShareToken(token);
    if (result.ok === false) {
      setState({ status: 'error', reason: result.reason });
      return;
    }
    setState({ status: 'ok', payload: result.payload });
  }, [token]);

  const detail = useMemo(() => {
    if (state.status !== 'ok') return null;
    return getSharedPatientDetail(state.payload.permission);
  }, [state]);

  return { state, detail, formatExpiry };
}

export function ProviderChartShell({
  token,
  children,
  crumb,
}: {
  token: string;
  crumb?: string;
  children: (ctx: {
    detail: SharedPatientDetail;
    payload: ShareTokenPayload;
    expiresAtLabel: string;
  }) => ReactNode;
}) {
  const { state, detail } = useShareAccess(token);
  const [verified, setVerified] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setVerified(isShareVerified(token));
    setReady(true);
  }, [token]);

  const showGate = ready && state.status === 'ok' && !verified;
  const showChart = state.status === 'ok' && detail && verified;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-header text-header-foreground">
        <div className="mx-auto flex h-12 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <p className="text-[13px] tracking-[0.08em]">
            <span className="font-semibold">TrialClinIQ</span>
            <span className="mx-2 opacity-40">/</span>
            <span className="opacity-70">Shared chart</span>
            {crumb && (
              <>
                <span className="mx-2 opacity-40">/</span>
                <span className="opacity-90">{crumb}</span>
              </>
            )}
          </p>
          {state.status === 'ok' && verified && (
            <p className="text-[12px] tabular-nums tracking-wide opacity-70">
              {sharePermissionLabel(state.payload.permission)} · ends {formatExpiry(state.payload.exp)}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10">
        {state.status === 'loading' && (
          <p className="py-24 text-center text-sm tracking-wide text-muted-foreground">Loading chart…</p>
        )}

        {state.status === 'error' && (
          <div className="mx-auto max-w-lg rounded-sm border border-border bg-card p-8">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Access blocked</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {state.reason === 'expired' && 'This share has expired'}
              {state.reason === 'revoked' && 'This share was revoked'}
              {state.reason === 'invalid' && 'This share link is invalid'}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Ask the patient to generate a new QR if access is still needed.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block rounded-sm border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Patient portal
            </Link>
          </div>
        )}

        {showGate && <ShareAccessGate token={token} onVerified={() => setVerified(true)} />}

        {showChart && (
          <div className="animate-chart-reveal">
            {children({
              detail,
              payload: state.payload,
              expiresAtLabel: formatExpiry(state.payload.exp),
            })}
          </div>
        )}

        {state.status === 'ok' && !verified && ready && (
          <div className="mx-auto max-w-md py-24 text-center">
            <p className="text-sm text-muted-foreground">Waiting for verification…</p>
          </div>
        )}
      </main>
    </div>
  );
}

export function useProviderToken(): string {
  const params = useParams<{ token: string }>();
  return decodeURIComponent(params.token ?? '');
}

export function DetailBackLink({ token }: { token: string }) {
  return (
    <Link
      href={`/patient/share/${encodeURIComponent(token)}`}
      className="inline-flex text-sm font-medium text-primary hover:underline"
    >
      ← Back to patient chart
    </Link>
  );
}

export function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}
