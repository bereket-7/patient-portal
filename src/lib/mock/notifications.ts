const READ_STORAGE_KEY = 'trialcliniq.patient.notifications.read';
const CUSTOM_STORAGE_KEY = 'trialcliniq.patient.notifications.custom';
const WELCOME_SENT_KEY = 'trialcliniq.patient.notifications.welcome-sent';
const CONSENT_PENDING_SENT_KEY = 'trialcliniq.patient.notifications.consent-pending-sent';

export const PATIENT_NOTIFICATIONS_CHANGED = 'trialcliniq:patient-notifications-changed';

export type PatientNotification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  href?: string;
  read: boolean;
};

type StoredNotification = Omit<PatientNotification, 'read'>;

const MOCK_NOTIFICATIONS: StoredNotification[] = [
  {
    id: 'notif-001',
    title: 'New trial match',
    message: 'You matched with Phase III Parkinson Disease Study (92% eligibility).',
    timestamp: '2026-07-12T10:00:00Z',
    href: '/trials/MATCH-001',
  },
  {
    id: 'notif-002',
    title: 'Coordinator review update',
    message: 'Diabetes Management Clinical Trial is now under coordinator review.',
    timestamp: '2026-07-11T15:30:00Z',
    href: '/trials/MATCH-002',
  },
  {
    id: 'notif-003',
    title: 'Screening reminder',
    message: 'Cardiovascular Health Prevention Study — screening visit available next week.',
    timestamp: '2026-07-10T09:00:00Z',
    href: '/participation',
  },
];

function loadReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

function loadCustomNotifications(): StoredNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredNotification[]) : [];
  } catch {
    return [];
  }
}

function saveCustomNotifications(items: StoredNotification[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(items));
}

function emitNotificationsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PATIENT_NOTIFICATIONS_CHANGED));
}

export function addPatientNotification(input: Omit<StoredNotification, 'id'> & { id?: string }): void {
  const id = input.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const existing = loadCustomNotifications();
  if (existing.some((n) => n.id === id)) return;
  saveCustomNotifications([{ ...input, id }, ...existing]);
  emitNotificationsChanged();
}

export function sendWelcomeNotificationIfNeeded(accountId: string): void {
  if (typeof window === 'undefined') return;
  const flag = `${WELCOME_SENT_KEY}:${accountId}`;
  if (localStorage.getItem(flag)) return;
  addPatientNotification({
    id: `welcome-${accountId}`,
    title: 'Welcome to TrialClinIQ',
    message:
      'Your account is ready. View your digital welcome letter for next steps and connect HealthEx when you are ready.',
    timestamp: new Date().toISOString(),
    href: '/profile/welcome',
  });
  localStorage.setItem(flag, '1');
}

export function sendHealthExConsentPendingNotificationIfNeeded(accountId: string): void {
  if (typeof window === 'undefined') return;
  const flag = `${CONSENT_PENDING_SENT_KEY}:${accountId}`;
  if (localStorage.getItem(flag)) return;
  addPatientNotification({
    id: `consent-pending-${accountId}`,
    title: 'HealthEx consent required',
    message:
      'Check your email from HealthEx and complete consent in your wallet. Then return here and tap Sync from HealthEx.',
    timestamp: new Date().toISOString(),
    href: '/connect/healthex',
  });
  localStorage.setItem(flag, '1');
}

export function getNotifications(): PatientNotification[] {
  const readIds = loadReadIds();
  const combined = [...loadCustomNotifications(), ...MOCK_NOTIFICATIONS];
  return combined
    .map((n) => ({
      ...n,
      read: readIds.has(n.id),
    }))
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

export function markNotificationRead(id: string): void {
  const readIds = loadReadIds();
  readIds.add(id);
  saveReadIds(readIds);
  emitNotificationsChanged();
}

export function markAllNotificationsRead(): void {
  const readIds = new Set(getNotifications().map((n) => n.id));
  saveReadIds(readIds);
  emitNotificationsChanged();
}
