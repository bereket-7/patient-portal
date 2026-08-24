export type AuthMode = 'stub' | 'jwt' | 'external';

export type PortalKind = 'site' | 'sponsor' | 'admin' | 'patient';

export type AuthSession = {
  token: string;
  mode: AuthMode;
  scope: string;
  purpose: string;
  sub: string;
  role: string;
  patientId: string;
  organizationRef: string;
};

export type BackendAuthConfig = {
  devMode: boolean;
  jwksEnabled: boolean;
  stubMode: boolean;
  issuer: string;
  audience: string;
  jwksUri: string;
  mintEnabled: boolean;
};

export type ApiProbeResult = {
  ok: boolean;
  status: number;
  body: unknown;
  path: string;
  method: string;
};

export const PORTAL_PRESETS: Record<
  PortalKind,
  Pick<AuthSession, 'scope' | 'role' | 'sub'> & { defaultProbePath: string }
> = {
  site: {
    sub: 'coordinator-dev',
    scope: 'user/*.read patient/*.read',
    role: 'research_coordinator',
    defaultProbePath: '/api/v1/coordinator/review-queue?site_id=SITE-001',
  },
  sponsor: {
    sub: 'sponsor-dev',
    scope: 'user/*.read',
    role: 'sponsor_user',
    defaultProbePath: '/api/v1/reports/sponsor/TRIAL-001/funnel',
  },
  admin: {
    sub: 'admin-dev',
    scope: 'user/*.read',
    role: 'trialcliniq_admin',
    defaultProbePath: '/api/v1/reports/admin/summary',
  },
  patient: {
    sub: 'patient-dev',
    scope: 'patient/*.read',
    role: 'patient',
    defaultProbePath: '/api/v1/consent',
  },
};

export const STORAGE_KEY = 'trialcliniq.auth.session';
