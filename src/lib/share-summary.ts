import type { HealthRecords } from '@/lib/types/health-records';
import type { SharePermission } from '@/lib/types/share';
import { getHealthRecords } from '@/lib/mock/health-records';
import { loadAccount } from '@/lib/mock/patient-account-store';

export type SharedPatientProfile = {
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  mrn: string;
  phone: string;
  email: string;
  address: string;
  bloodType: string;
  primaryCarePhysician: string;
  insurance: string;
  healthExPatientId: string;
  emergencyContact: string;
};

export type SharedPatientDetail = {
  permission: SharePermission;
  profile: SharedPatientProfile;
  showVitals: boolean;
  showConditions: boolean;
  showMedications: boolean;
  showAllergies: boolean;
  showLabs: boolean;
  showImaging: boolean;
  showCholesterol: boolean;
  vitals: HealthRecords['vitals'];
  conditions: HealthRecords['conditions'];
  medications: HealthRecords['medications'];
  allergies: string[];
  observations: HealthRecords['observations'];
  cholesterol: HealthRecords['cholesterol'];
  lastScan: HealthRecords['lastScan'] | null;
  encounters: Array<{ id: string; type: string; facility: string; date: string; reason: string }>;
  procedures: Array<{ id: string; name: string; date: string; performer: string }>;
  coverage: Array<{ id: string; payer: string; plan: string; memberId: string; status: string }>;
};

function calcAge(dob: string): number {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return 42;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

const DEMO_PROFILE: SharedPatientProfile = {
  fullName: 'Jordan Hale',
  dateOfBirth: '1984-03-18',
  age: 42,
  gender: 'Female',
  mrn: 'MRN-4829173',
  phone: '+1 (617) 555-0148',
  email: 'jordan.hale@email.com',
  address: '84 Beacon St, Boston, MA 02108',
  bloodType: 'A+',
  primaryCarePhysician: 'Dr. Amira Patel, MD',
  insurance: 'Blue Cross PPO',
  healthExPatientId: 'HEX-PT-100284',
  emergencyContact: 'Sam Hale · +1 (617) 555-0199',
};

function resolveProfile(): SharedPatientProfile {
  const account = loadAccount();
  if (!account) return { ...DEMO_PROFILE, age: calcAge(DEMO_PROFILE.dateOfBirth) };

  return {
    fullName: `${account.firstName} ${account.lastName}`.trim() || DEMO_PROFILE.fullName,
    dateOfBirth: account.dateOfBirth || DEMO_PROFILE.dateOfBirth,
    age: calcAge(account.dateOfBirth || DEMO_PROFILE.dateOfBirth),
    gender: account.gender
      ? account.gender.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : DEMO_PROFILE.gender,
    mrn: `MRN-${account.id.replace(/\D/g, '').slice(-7).padStart(7, '0') || '4829173'}`,
    phone: account.phone || DEMO_PROFILE.phone,
    email: account.email || DEMO_PROFILE.email,
    address: account.address || DEMO_PROFILE.address,
    bloodType: DEMO_PROFILE.bloodType,
    primaryCarePhysician: DEMO_PROFILE.primaryCarePhysician,
    insurance: DEMO_PROFILE.insurance,
    healthExPatientId: account.healthExPatientId || DEMO_PROFILE.healthExPatientId,
    emergencyContact: DEMO_PROFILE.emergencyContact,
  };
}

const ENCOUNTERS = [
  {
    id: 'e1',
    type: 'Outpatient visit',
    facility: 'NewAge Hospital — Neurology',
    date: '04 Jul 2026',
    reason: 'Follow-up hypertension & vitals review',
  },
  {
    id: 'e2',
    type: 'Imaging',
    facility: 'NewAge Hospital — Radiology',
    date: '15 Jun 2026',
    reason: 'Chest X-Ray',
  },
  {
    id: 'e3',
    type: 'Lab draw',
    facility: 'Quest Diagnostics — Back Bay',
    date: '01 Jun 2026',
    reason: 'Metabolic panel & lipids',
  },
];

const PROCEDURES = [
  {
    id: 'p1',
    name: 'Chest X-Ray (2 views)',
    date: '15 Jun 2026',
    performer: 'Dr. Luis Ortega',
  },
  {
    id: 'p2',
    name: 'ECG — 12 lead',
    date: '18 Aug 2023',
    performer: 'Dr. Amira Patel',
  },
];

const COVERAGE = [
  {
    id: 'c1',
    payer: 'Blue Cross Blue Shield',
    plan: 'PPO Gold',
    memberId: 'BCBS-8842109',
    status: 'Active',
  },
];

export function getSharedPatientDetail(
  permission: SharePermission,
  records: HealthRecords = getHealthRecords(),
): SharedPatientDetail {
  const profile = resolveProfile();
  const base: SharedPatientDetail = {
    permission,
    profile,
    showVitals: false,
    showConditions: false,
    showMedications: false,
    showAllergies: false,
    showLabs: false,
    showImaging: false,
    showCholesterol: false,
    vitals: [],
    conditions: [],
    medications: [],
    allergies: [],
    observations: [],
    cholesterol: [],
    lastScan: null,
    encounters: [],
    procedures: [],
    coverage: [],
  };

  switch (permission) {
    case 'MEDICATIONS':
      return { ...base, showMedications: true, medications: records.medications };
    case 'ALLERGIES':
      return { ...base, showAllergies: true, allergies: records.allergies };
    case 'CONDITIONS':
      return { ...base, showConditions: true, conditions: records.conditions };
    case 'RECENT_LABS':
      return {
        ...base,
        showLabs: true,
        showVitals: true,
        showCholesterol: true,
        observations: records.observations,
        vitals: records.vitals,
        cholesterol: records.cholesterol,
      };
    case 'ALL':
    default:
      return {
        ...base,
        showVitals: true,
        showConditions: true,
        showMedications: true,
        showAllergies: true,
        showLabs: true,
        showImaging: true,
        showCholesterol: true,
        vitals: records.vitals,
        conditions: records.conditions,
        medications: records.medications,
        allergies: records.allergies,
        observations: records.observations,
        cholesterol: records.cholesterol,
        lastScan: records.lastScan,
        encounters: ENCOUNTERS,
        procedures: PROCEDURES,
        coverage: COVERAGE,
      };
  }
}

/** @deprecated use getSharedPatientDetail */
export function getFilteredClinicalSummary(permission: SharePermission) {
  return getSharedPatientDetail(permission);
}
