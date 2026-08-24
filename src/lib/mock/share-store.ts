import {
  DEFAULT_SHARE_TTL_MS,
  type ActiveShare,
  type ShareAuditEvent,
  type SharePermission,
  type ShareTokenPayload,
} from '@/lib/types/share';

const ACTIVE_KEY = 'trialcliniq.patient.share.active';
const REVOKED_KEY = 'trialcliniq.patient.share.revoked';
const AUDIT_KEY = 'trialcliniq.patient.share.audit';

function toBase64Url(value: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(value, 'utf8').toString('base64url');
  }
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const base64 = padded + pad;
  if (typeof window === 'undefined') {
    return Buffer.from(base64, 'base64').toString('utf8');
  }
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function randomNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function encodeToken(payload: ShareTokenPayload): string {
  return `shr_${toBase64Url(JSON.stringify(payload))}`;
}

export function decodeShareToken(token: string): ShareTokenPayload | null {
  if (!token.startsWith('shr_')) return null;
  try {
    const raw = fromBase64Url(token.slice(4));
    const parsed = JSON.parse(raw) as ShareTokenPayload;
    if (parsed.v !== 1 || !parsed.permission || !parsed.exp || !parsed.nonce) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function pushAudit(event: Omit<ShareAuditEvent, 'id'>) {
  const existing = readJson<ShareAuditEvent[]>(AUDIT_KEY, []);
  const next: ShareAuditEvent = {
    id: `aud_${randomNonce()}`,
    ...event,
  };
  writeJson(AUDIT_KEY, [next, ...existing].slice(0, 50));
}

export function getActiveShare(): ActiveShare | null {
  const share = readJson<ActiveShare | null>(ACTIVE_KEY, null);
  if (!share) return null;
  if (share.revoked) return null;
  if (Date.parse(share.expiresAt) <= Date.now()) {
    pushAudit({
      action: 'expired',
      tokenNonce: decodeShareToken(share.token)?.nonce ?? 'unknown',
      permission: share.permission,
      at: new Date().toISOString(),
    });
    localStorage.removeItem(ACTIVE_KEY);
    return null;
  }
  return share;
}

export function getShareAudit(): ShareAuditEvent[] {
  return readJson<ShareAuditEvent[]>(AUDIT_KEY, []);
}

export function isTokenRevoked(nonce: string): boolean {
  const revoked = readJson<string[]>(REVOKED_KEY, []);
  return revoked.includes(nonce);
}

export function generateShare(permission: SharePermission, ttlMs = DEFAULT_SHARE_TTL_MS): ActiveShare {
  const now = Date.now();
  const payload: ShareTokenPayload = {
    v: 1,
    permission,
    iat: now,
    exp: now + ttlMs,
    nonce: randomNonce(),
  };
  const token = encodeToken(payload);
  const share: ActiveShare = {
    token,
    permission,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(payload.exp).toISOString(),
    revoked: false,
  };
  writeJson(ACTIVE_KEY, share);
  pushAudit({
    action: 'created',
    tokenNonce: payload.nonce,
    permission,
    at: share.createdAt,
  });
  return share;
}

export function revokeActiveShare(): ActiveShare | null {
  const current = getActiveShare();
  if (!current) return null;
  const payload = decodeShareToken(current.token);
  if (payload) {
    const revoked = readJson<string[]>(REVOKED_KEY, []);
    writeJson(REVOKED_KEY, [payload.nonce, ...revoked].slice(0, 100));
    pushAudit({
      action: 'revoked',
      tokenNonce: payload.nonce,
      permission: current.permission,
      at: new Date().toISOString(),
    });
  }
  localStorage.removeItem(ACTIVE_KEY);
  return { ...current, revoked: true };
}

export type ShareAccessResult =
  | { ok: true; payload: ShareTokenPayload }
  | { ok: false; reason: 'invalid' | 'expired' | 'revoked' };

export function accessShareToken(token: string): ShareAccessResult {
  const payload = decodeShareToken(token);
  if (!payload) return { ok: false, reason: 'invalid' };
  if (isTokenRevoked(payload.nonce)) return { ok: false, reason: 'revoked' };
  if (payload.exp <= Date.now()) return { ok: false, reason: 'expired' };

  pushAudit({
    action: 'accessed',
    tokenNonce: payload.nonce,
    permission: payload.permission,
    at: new Date().toISOString(),
  });

  return { ok: true, payload };
}

export function buildShareViewUrl(token: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/patient/share/${encodeURIComponent(token)}`;
}
