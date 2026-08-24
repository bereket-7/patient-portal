import type { PatientAccount, RegistrationInput } from '@/lib/types/patient-account';

/** Isolated from staff portal session (`trialcliniq.auth.session`). */
const STORAGE_KEY = 'trialcliniq.patient.auth.account';
const LEGACY_STORAGE_KEY = 'trialcliniq_patient_account';

function generateId(): string {
  return `patient-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadAccount(): PatientAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (raw) {
        localStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    if (!raw) return null;
    return JSON.parse(raw) as PatientAccount;
  } catch {
    return null;
  }
}

export function saveAccount(account: PatientAccount): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
}

export function clearAccount(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function registerAccount(input: RegistrationInput): PatientAccount {
  const account: PatientAccount = {
    id: generateId(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    dateOfBirth: input.dateOfBirth,
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    passwordHash: input.password.trim(),
    gender: input.gender,
    address: input.address,
    emailVerified: false,
    phoneVerified: false,
    isLoggedIn: false,
    healthExConnected: false,
    consentStatus: 'none',
  };
  saveAccount(account);
  return account;
}

export function verifyEmail(account: PatientAccount): PatientAccount {
  const updated = { ...account, emailVerified: true };
  saveAccount(updated);
  return updated;
}

export function verifyPhone(account: PatientAccount): PatientAccount {
  const updated = { ...account, phoneVerified: true };
  saveAccount(updated);
  return updated;
}

export function loginAccount(account: PatientAccount, email: string, password: string): PatientAccount | null {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (account.email !== normalizedEmail || account.passwordHash !== normalizedPassword) {
    return null;
  }
  const updated = {
    ...account,
    isLoggedIn: true,
    // Gateway JWT is minted via AuthProvider / patient-auth-bridge — not stored here.
  };
  saveAccount(updated);
  return updated;
}

export function logoutAccount(account: PatientAccount): PatientAccount {
  const updated = { ...account, isLoggedIn: false, mockAccessToken: undefined };
  saveAccount(updated);
  return updated;
}

export function startHealthExSession(account: PatientAccount): PatientAccount {
  const updated = {
    ...account,
    healthexSessionActive: true,
    healthExConnected: Boolean(account.healthExReferenceId || account.healthExPatientId),
  };
  saveAccount(updated);
  return updated;
}

export function grantHealthExConsent(account: PatientAccount): PatientAccount {
  const updated: PatientAccount = {
    ...account,
    healthExConnected: true,
    consentStatus: 'granted',
    consentGrantedAt: new Date().toISOString(),
    consentRevokedAt: undefined,
    healthexSessionActive: false,
  };
  saveAccount(updated);
  return updated;
}

export function denyHealthExConsent(account: PatientAccount): PatientAccount {
  const updated: PatientAccount = {
    ...account,
    consentStatus: 'denied',
    healthexSessionActive: false,
  };
  saveAccount(updated);
  return updated;
}

export function revokeHealthExConsent(account: PatientAccount): PatientAccount {
  const updated: PatientAccount = {
    ...account,
    healthExConnected: false,
    consentStatus: 'revoked',
    consentRevokedAt: new Date().toISOString(),
    healthexSessionActive: false,
    healthexAccessToken: undefined,
    mockAccessToken: undefined,
  };
  saveAccount(updated);
  return updated;
}

export function updateAccount(account: PatientAccount, patch: Partial<PatientAccount>): PatientAccount {
  const updated = { ...account, ...patch };
  saveAccount(updated);
  return updated;
}
