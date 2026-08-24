'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { probeApi } from './apiClient';
import { PORTAL_PRESETS, type ApiProbeResult } from './types';

const fieldStyle: React.CSSProperties = { display: 'grid', gap: '0.35rem', marginBottom: '0.75rem' };
const inputStyle: React.CSSProperties = {
  padding: '0.5rem',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
};
const btnStyle: React.CSSProperties = {
  padding: '0.5rem 0.875rem',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  background: '#fff',
  cursor: 'pointer',
  marginRight: '0.5rem',
  marginBottom: '0.5rem',
};
const primaryBtn: React.CSSProperties = { ...btnStyle, background: '#2563eb', color: '#fff', borderColor: '#2563eb' };

function ResultCard({ result }: { result: ApiProbeResult }) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '0.75rem',
        marginTop: '0.5rem',
        background: result.ok ? '#f0fdf4' : '#fef2f2',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
        {result.method} {result.path} → {result.status}
      </div>
      <pre style={{ margin: 0, fontSize: '0.75rem', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(result.body, null, 2)}
      </pre>
    </div>
  );
}

export function AuthTestPage() {
  const { portal, session, backendConfig, loading, updateSession, resetSession, mintJwt, setExternalToken } =
    useAuth();
  const preset = PORTAL_PRESETS[portal];
  const [results, setResults] = useState<ApiProbeResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [probePath, setProbePath] = useState(preset.defaultProbePath);
  const [externalToken, setExternalTokenInput] = useState('');

  async function runProbe(path: string, overrideSession = session, method = 'GET') {
    setBusy(true);
    setError('');
    try {
      const result = await probeApi(path, overrideSession, method);
      setResults((prev) => [result, ...prev].slice(0, 8));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Probe failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleMintJwt() {
    setBusy(true);
    setError('');
    try {
      await mintJwt();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Mint failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: 960 }}>
      <h1 style={{ marginTop: 0 }}>Authentication Test Console</h1>
      <p style={{ color: '#475569' }}>
        Configure credentials and probe the API gateway. Headers match backend expectations:{' '}
        <code>Authorization</code>, SMART scopes, <code>x-purpose-of-use</code>, and optional{' '}
        <code>x-fhir-scope</code> in dev stub mode.
      </p>

      <section style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0, fontSize: '1rem' }}>Backend auth config</h2>
        {loading ? (
          <p>Loading…</p>
        ) : backendConfig ? (
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
            <li>Dev stub: {backendConfig.stubMode ? 'yes' : 'no'}</li>
            <li>JWKS enabled: {backendConfig.jwksEnabled ? 'yes' : 'no'}</li>
            <li>Token mint: {backendConfig.mintEnabled ? 'yes' : 'no'}</li>
            <li>Issuer: {backendConfig.issuer}</li>
            <li>Audience: {backendConfig.audience}</li>
            <li>JWKS URI: {backendConfig.jwksUri}</li>
          </ul>
        ) : (
          <p style={{ color: '#b45309' }}>Could not reach /dev/auth/config — is the API gateway running?</p>
        )}
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem' }}>Session</h2>
        <label style={fieldStyle}>
          Mode
          <select
            value={session.mode}
            onChange={(e) => updateSession({ mode: e.target.value as typeof session.mode })}
            style={inputStyle}
          >
            <option value="stub">Dev stub (any bearer token)</option>
            <option value="jwt">Signed JWT (dev mint)</option>
            <option value="external">External JWT (paste token)</option>
          </select>
        </label>
        <label style={fieldStyle}>
          Bearer token
          <input
            value={session.token}
            onChange={(e) => updateSession({ token: e.target.value })}
            style={inputStyle}
            placeholder="dev-token"
          />
        </label>
        <label style={fieldStyle}>
          Subject (sub)
          <input value={session.sub} onChange={(e) => updateSession({ sub: e.target.value })} style={inputStyle} />
        </label>
        <label style={fieldStyle}>
          SMART scope
          <input value={session.scope} onChange={(e) => updateSession({ scope: e.target.value })} style={inputStyle} />
        </label>
        <label style={fieldStyle}>
          Purpose of use
          <input
            value={session.purpose}
            onChange={(e) => updateSession({ purpose: e.target.value })}
            style={inputStyle}
          />
        </label>
        <label style={fieldStyle}>
          Role (x-user-role)
          <input value={session.role} onChange={(e) => updateSession({ role: e.target.value })} style={inputStyle} />
        </label>
        <label style={fieldStyle}>
          Patient ID (x-patient-id)
          <input
            value={session.patientId}
            onChange={(e) => updateSession({ patientId: e.target.value })}
            style={inputStyle}
          />
        </label>

        <div style={{ marginTop: '0.5rem' }}>
          {backendConfig?.mintEnabled && (
            <button type="button" style={primaryBtn} disabled={busy} onClick={handleMintJwt}>
              Mint signed JWT
            </button>
          )}
          <button type="button" style={btnStyle} disabled={busy} onClick={resetSession}>
            Reset defaults
          </button>
        </div>

        {session.mode === 'external' && (
          <div style={{ marginTop: '0.75rem' }}>
            <label style={fieldStyle}>
              Paste external token
              <textarea
                value={externalToken}
                onChange={(e) => setExternalTokenInput(e.target.value)}
                style={{ ...inputStyle, minHeight: 80 }}
              />
            </label>
            <button
              type="button"
              style={btnStyle}
              onClick={() => setExternalToken(externalToken.trim())}
              disabled={!externalToken.trim()}
            >
              Use external token
            </button>
          </div>
        )}
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem' }}>Probe API</h2>
        <label style={fieldStyle}>
          Path
          <input value={probePath} onChange={(e) => setProbePath(e.target.value)} style={inputStyle} />
        </label>
        <div>
          <button type="button" style={primaryBtn} disabled={busy} onClick={() => runProbe('/health')}>
            GET /health (no auth)
          </button>
          <button type="button" style={primaryBtn} disabled={busy} onClick={() => runProbe(probePath)}>
            GET protected route
          </button>
          <button
            type="button"
            style={btnStyle}
            disabled={busy}
            onClick={() => runProbe(probePath, { ...session, token: 'invalid-token' })}
          >
            Invalid token → 401
          </button>
          <button
            type="button"
            style={btnStyle}
            disabled={busy}
            onClick={() =>
              runProbe(probePath, { ...session, scope: 'openid', mode: session.mode === 'stub' ? 'stub' : session.mode })
            }
          >
            Wrong scope → 403
          </button>
          <button
            type="button"
            style={btnStyle}
            disabled={busy}
            onClick={() => runProbe(probePath, { ...session, token: '' })}
          >
            No token → 401
          </button>
        </div>
      </section>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {results.map((r, i) => (
        <ResultCard key={`${r.path}-${r.status}-${i}`} result={r} />
      ))}

      <section style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#64748b' }}>
        <h2 style={{ fontSize: '1rem', color: '#0f172a' }}>Local JWKS testing</h2>
        <p>To test real JWT validation locally, set these on the API gateway and restart:</p>
        <pre style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '6px', overflow: 'auto' }}>
{`AUTH_JWKS_ENABLED=true
AUTH_DEV_MODE=true
OAUTH_JWKS_URI=http://localhost:3000/dev/.well-known/jwks.json
OAUTH_ISSUER=http://localhost:3000/dev
OAUTH_AUDIENCE=trialcliniq-api`}
        </pre>
        <p>Then click <strong>Mint signed JWT</strong> above and probe protected routes.</p>
      </section>
    </main>
  );
}
