'use client';

import { useAuth } from './AuthProvider';

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  padding: '0.75rem 1.5rem',
  borderBottom: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontFamily: 'system-ui',
  fontSize: '0.875rem',
};

export function AppShell({
  title,
  homeHref = '/',
  children,
}: {
  title: string;
  homeHref?: string;
  children: React.ReactNode;
}) {
  const { session, backendConfig, loading } = useAuth();
  const modeLabel = loading
    ? 'Loading…'
    : backendConfig?.jwksEnabled
      ? 'JWKS'
      : backendConfig?.stubMode
        ? 'Dev stub'
        : 'Unknown';

  return (
    <>
      <header style={barStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href={homeHref} style={{ fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}>
            {title}
          </a>
          <a href="/auth" style={{ color: '#2563eb', textDecoration: 'none' }}>
            Auth test
          </a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
          <span>
            Mode: <strong>{modeLabel}</strong>
          </span>
          <span>
            User: <strong>{session.sub || '—'}</strong>
          </span>
          <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Token: {session.token ? `${session.token.slice(0, 12)}…` : 'none'}
          </span>
        </div>
      </header>
      {children}
    </>
  );
}
