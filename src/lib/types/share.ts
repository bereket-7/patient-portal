export type SharePermission =
  | 'ALL'
  | 'MEDICATIONS'
  | 'ALLERGIES'
  | 'CONDITIONS'
  | 'RECENT_LABS';

export type SharePermissionOption = {
  id: SharePermission;
  label: string;
  description: string;
};

export const SHARE_PERMISSION_OPTIONS: SharePermissionOption[] = [
  {
    id: 'ALL',
    label: 'All clinical data',
    description: 'Conditions, medications, allergies, and recent labs',
  },
  {
    id: 'MEDICATIONS',
    label: 'Medications',
    description: 'Active medication list only',
  },
  {
    id: 'ALLERGIES',
    label: 'Allergies',
    description: 'Allergy and intolerance list only',
  },
  {
    id: 'CONDITIONS',
    label: 'Conditions',
    description: 'Active conditions and diagnoses only',
  },
  {
    id: 'RECENT_LABS',
    label: 'Recent labs',
    description: 'Recent laboratory observations only',
  },
];

export const DEFAULT_SHARE_TTL_MS = 24 * 60 * 60 * 1000;

export type ShareTokenPayload = {
  v: 1;
  permission: SharePermission;
  exp: number;
  iat: number;
  nonce: string;
};

export type ActiveShare = {
  token: string;
  permission: SharePermission;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
};

export type ShareAuditEvent = {
  id: string;
  action: 'created' | 'accessed' | 'revoked' | 'expired';
  tokenNonce: string;
  permission: SharePermission;
  at: string;
};

export function sharePermissionLabel(permission: SharePermission): string {
  return SHARE_PERMISSION_OPTIONS.find((o) => o.id === permission)?.label ?? permission;
}
