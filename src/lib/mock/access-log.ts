export type AccessLogEventType =
  | 'patient_record_access'
  | 'consent_validation'
  | 'phi_access'
  | 'api_request'
  | 'consent_violation';

export type AccessLogEntry = {
  id: string;
  eventType: AccessLogEventType;
  actor: string;
  organization: string;
  action: string;
  purpose: string;
  outcome: 'SUCCESS' | 'FAILURE';
  timestamp: string;
};

export const MOCK_ACCESS_LOG: AccessLogEntry[] = [
  {
    id: 'AUD-001',
    eventType: 'consent_validation',
    actor: 'TrialClinIQ Platform',
    organization: 'TrialClinIQ',
    action: 'Consent validated for research access',
    purpose: 'RESRCH',
    outcome: 'SUCCESS',
    timestamp: '2026-07-10T14:22:00Z',
  },
  {
    id: 'AUD-002',
    eventType: 'phi_access',
    actor: 'Matching Engine',
    organization: 'TrialClinIQ',
    action: 'Eligibility rules evaluated',
    purpose: 'RESRCH',
    outcome: 'SUCCESS',
    timestamp: '2026-07-10T14:23:15Z',
  },
  {
    id: 'AUD-003',
    eventType: 'patient_record_access',
    actor: 'Dr. Sarah Chen',
    organization: 'Boston Clinical Research Center',
    action: 'Viewed match profile',
    purpose: 'RESRCH',
    outcome: 'SUCCESS',
    timestamp: '2026-07-11T09:15:00Z',
  },
  {
    id: 'AUD-004',
    eventType: 'api_request',
    actor: 'Reporting Service',
    organization: 'TrialClinIQ',
    action: 'Generated clinical summary',
    purpose: 'RESRCH',
    outcome: 'SUCCESS',
    timestamp: '2026-07-11T09:16:30Z',
  },
  {
    id: 'AUD-005',
    eventType: 'patient_record_access',
    actor: 'James Rivera',
    organization: 'Boston Clinical Research Center',
    action: 'Reviewed coordinator queue entry',
    purpose: 'RESRCH',
    outcome: 'SUCCESS',
    timestamp: '2026-07-12T11:42:00Z',
  },
  {
    id: 'AUD-006',
    eventType: 'consent_validation',
    actor: 'TrialClinIQ Platform',
    organization: 'TrialClinIQ',
    action: 'Consent re-validated before screening data pull',
    purpose: 'RESRCH',
    outcome: 'SUCCESS',
    timestamp: '2026-07-13T08:05:00Z',
  },
  {
    id: 'AUD-007',
    eventType: 'patient_record_access',
    actor: 'Maria Lopez',
    organization: 'Brookline Heart Institute',
    action: 'Opened screening documentation',
    purpose: 'RESRCH',
    outcome: 'SUCCESS',
    timestamp: '2026-07-13T10:20:00Z',
  },
  {
    id: 'AUD-008',
    eventType: 'consent_violation',
    actor: 'Sponsor Analytics Service',
    organization: 'TrialClinIQ',
    action: 'Blocked attempt to read patient identifiers',
    purpose: 'RESRCH',
    outcome: 'FAILURE',
    timestamp: '2026-07-12T16:01:00Z',
  },
];

export function getAccessLog(): AccessLogEntry[] {
  return [...MOCK_ACCESS_LOG].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export function getEventTypeLabel(type: AccessLogEventType): string {
  switch (type) {
    case 'patient_record_access':
      return 'Record Access';
    case 'consent_validation':
      return 'Consent Check';
    case 'phi_access':
      return 'PHI Processing';
    case 'api_request':
      return 'API Request';
    case 'consent_violation':
      return 'Consent Violation';
    default:
      return type;
  }
}
