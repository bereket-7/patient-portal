import type { PatientAccount } from '@/lib/types/patient-account';

/** Display-oriented patient profile fields (enriched for portal demo). */
export type PatientProfileDetails = {
  preferredName: string;
  middleName?: string;
  suffix?: string;
  age: number | null;
  sexAtBirth?: string;
  genderIdentity?: string;
  maritalStatus?: string;
  preferredLanguage: string;
  raceEthnicity?: string;
  emailSecondary?: string;
  phoneMobile?: string;
  phoneHome?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  primaryCareProvider?: string;
  primaryCareOrg?: string;
  insurancePlan?: string;
  insuranceMemberId?: string;
  mrn?: string;
  bloodType?: string;
  communicationPreferences: string[];
  notificationPreferences: string[];
  timezone: string;
  accountCreatedLabel: string;
};

function calcAge(dateOfBirth: string): number | null {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}

function parseAddress(address?: string): {
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
} {
  if (!address?.trim()) return {};
  // Expected: "42 Beacon St, Boston, MA 02108" or free text
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length >= 3) {
    const region = parts[parts.length - 1].split(/\s+/);
    const postalCode = region.find((t) => /^\d{5}(-\d{4})?$/.test(t));
    const state = region.find((t) => /^[A-Z]{2}$/i.test(t));
    return {
      addressLine1: parts.slice(0, -2).join(', ') || parts[0],
      city: parts[parts.length - 2],
      state: state?.toUpperCase(),
      postalCode,
    };
  }
  if (parts.length === 2) {
    return { addressLine1: parts[0], city: parts[1] };
  }
  return { addressLine1: address };
}

/**
 * Builds a rich profile view model from the stored account, filling demo
 * HealthEx demographics so the Profile page is data-complete for reviews.
 */
export function getPatientProfileDetails(account: PatientAccount): PatientProfileDetails {
  const parsed = parseAddress(account.address);
  const sexAtBirth =
    account.gender === 'male'
      ? 'Male'
      : account.gender === 'female'
        ? 'Female'
        : account.gender
          ? account.gender.replace(/-/g, ' ')
          : 'Female';

  return {
    preferredName: account.firstName,
    middleName: account.firstName.toLowerCase().startsWith('a') ? 'Marie' : undefined,
    age: calcAge(account.dateOfBirth),
    sexAtBirth,
    genderIdentity: sexAtBirth,
    maritalStatus: 'Married',
    preferredLanguage: 'English',
    raceEthnicity: 'Prefer not to say',
    emailSecondary: account.email.includes('+')
      ? undefined
      : `contact.${account.firstName.toLowerCase()}@example.com`,
    phoneMobile: account.phone,
    phoneHome: '+1-617-555-0199',
    addressLine1: parsed.addressLine1 || '42 Beacon Street',
    addressLine2: 'Apt 4B',
    city: parsed.city || 'Boston',
    state: parsed.state || 'MA',
    postalCode: parsed.postalCode || '02108',
    country: 'United States',
    emergencyContactName: 'Jordan Nguyen',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+1-617-555-0177',
    primaryCareProvider: 'Dr. Emily Walsh, MD',
    primaryCareOrg: 'Beacon Family Medicine',
    insurancePlan: 'Blue Cross Blue Shield PPO',
    insuranceMemberId: `BCBS-${account.id.slice(-6).toUpperCase()}`,
    mrn: `MRN-${account.id.slice(-8).toUpperCase()}`,
    bloodType: 'O+',
    communicationPreferences: ['Email', 'SMS', 'In-app notifications'],
    notificationPreferences: [
      'Trial match updates',
      'Coordinator messages',
      'Screening reminders',
      'Consent & privacy alerts',
    ],
    timezone: 'America/New_York (ET)',
    accountCreatedLabel: 'Patient portal account',
  };
}
