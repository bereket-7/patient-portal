export type NavItem = {
  label: string;
  href: string;
};

export const PATIENT_PORTAL_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Share', href: '/profile/share' },
  { label: 'Trial Matches', href: '/trials' },
  { label: 'My Participation', href: '/participation' },
  { label: 'Profile', href: '/profile' },
];

export const PRIVACY_NAV: NavItem[] = [
  { label: 'Consent & Privacy', href: '/consent' },
  { label: 'Data Access Log', href: '/privacy/access-log' },
];

/** Registration-only steps — login is a separate, isolated flow. */
export const REGISTRATION_STEPS = [
  { step: 1, label: 'Account', href: '/register' },
  { step: 2, label: 'Verify Email', href: '/verify-email' },
  { step: 3, label: 'Verify Phone', href: '/verify-phone' },
] as const;

export const HEALTH_RECORD_NAV: NavItem[] = [
  { label: 'Visits & Encounters', href: '/health/visits' },
  { label: 'Observations', href: '/health/observations' },
  { label: 'Conditions', href: '/health/conditions' },
  { label: 'Medications', href: '/health/medications' },
];
