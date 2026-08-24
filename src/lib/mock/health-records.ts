import type { HealthRecords } from '@/lib/types/health-records';

export const MOCK_HEALTH_RECORDS: HealthRecords = {
  vitals: [
    { id: 'bmi', label: 'BMI', value: '22.17', unit: 'kg/m²', date: '04 Jul 2026', color: 'bg-vital-bmi' },
    { id: 'bp', label: 'Blood Pressure', value: '130/84', unit: 'mmHg', date: '04 Jul 2026', color: 'bg-vital-bp' },
    { id: 'glucose', label: 'Glucose', value: '95', unit: 'mg/dL', date: '03 Jul 2026', color: 'bg-vital-glucose' },
    { id: 'weight', label: 'Weight', value: '72.5', unit: 'kg', date: '04 Jul 2026', color: 'bg-vital-weight' },
    { id: 'heart', label: 'Heart Rate', value: '72', unit: 'bpm', date: '04 Jul 2026', color: 'bg-vital-heart' },
    { id: 'spo2', label: 'SpO₂', value: '98', unit: '%', date: '04 Jul 2026', color: 'bg-vital-spo2' },
  ],
  lastScan: {
    title: 'Chest X-Ray',
    facility: 'NewAge Hospital',
    address: '123 Medical Center Dr, Boston, MA 02115',
    date: '15 Jun 2026, 10:30 AM',
  },
  cholesterol: [
    { year: '2012', value: 38, inRange: false },
    { year: '2013', value: 42, inRange: false },
    { year: '2014', value: 48, inRange: true },
    { year: '2015', value: 52, inRange: true },
    { year: '2016', value: 55, inRange: true },
  ],
  conditions: [
    { id: '1', name: 'Night Vision Impairment', period: '12 Jan 2025', severity: 'Complaint' },
    { id: '2', name: 'Urinary Tract Infection', period: '03 Mar 2024', severity: 'Severe' },
    { id: '3', name: 'Hypertension', period: '18 Aug 2023', severity: 'Moderate' },
    { id: '4', name: 'Seasonal Allergic Rhinitis', period: '05 Apr 2022', severity: 'Mild' },
    { id: '5', name: 'Type 2 Diabetes Mellitus', period: '10 Jan 2024', severity: 'Moderate' },
    { id: '6', name: 'Hyperlipidemia', period: '22 Feb 2025', severity: 'Mild' },
    { id: '7', name: 'Osteoarthritis of Knee', period: '08 Sep 2023', severity: 'Mild' },
  ],
  allergies: [
    'Allergenic Extract',
    'Penicillin',
    'Cashew nuts',
    'Latex',
    'Sulfa drugs',
  ],
  medications: [
    { id: '1', name: 'Lisinopril', dosage: '10mg daily', status: 'Active', prescribedDate: '18 Aug 2023' },
    { id: '2', name: 'Metformin', dosage: '500mg twice daily', status: 'Active', prescribedDate: '10 Jan 2024' },
    { id: '3', name: 'Atorvastatin', dosage: '20mg daily', status: 'Active', prescribedDate: '22 Feb 2025' },
    { id: '4', name: 'Amlodipine', dosage: '5mg daily', status: 'Active', prescribedDate: '05 Mar 2025' },
    { id: '5', name: 'Omeprazole', dosage: '20mg daily', status: 'Completed', prescribedDate: '12 Nov 2023' },
    { id: '6', name: 'Ibuprofen', dosage: '400mg as needed', status: 'Stopped', prescribedDate: '01 Feb 2024' },
  ],
  observations: [
    { id: '1', name: 'Glucose', value: '95 mg/dL', date: '03 Jul 2026', status: 'Final' },
    { id: '2', name: 'HbA1c', value: '5.8 %', date: '01 Jun 2026', status: 'Final' },
    { id: '3', name: 'Total Cholesterol', value: '185 mg/dL', date: '01 Jun 2026', status: 'Final' },
    { id: '4', name: 'HDL Cholesterol', value: '55 mg/dL', date: '01 Jun 2026', status: 'Final' },
    { id: '5', name: 'LDL Cholesterol', value: '110 mg/dL', date: '01 Jun 2026', status: 'Final' },
    { id: '6', name: 'Triglycerides', value: '140 mg/dL', date: '01 Jun 2026', status: 'Final' },
    { id: '7', name: 'Creatinine', value: '0.9 mg/dL', date: '15 May 2026', status: 'Preliminary' },
    { id: '8', name: 'Potassium', value: '4.1 mmol/L', date: '15 May 2026', status: 'Final' },
  ],
  encounters: [
    {
      id: 'enc-001',
      type: 'Ambulatory · Follow-up',
      date: '2026-06-15T10:30:00Z',
      status: 'finished',
      facility: 'NewAge Hospital — Primary Care',
      provider: 'Dr. Emily Hartwell',
      reason: 'Hypertension management & medication review',
      classCode: 'AMB',
    },
    {
      id: 'enc-002',
      type: 'Outpatient · Diagnostic imaging',
      date: '2026-06-15T11:00:00Z',
      status: 'finished',
      facility: 'NewAge Hospital — Radiology',
      provider: 'Dr. James Okonkwo',
      reason: 'Chest X-Ray — routine screening',
      classCode: 'AMB',
    },
    {
      id: 'enc-003',
      type: 'Laboratory',
      date: '2026-06-01T08:15:00Z',
      status: 'finished',
      facility: 'Boston Clinical Labs',
      provider: 'Lab Services',
      reason: 'Lipid panel & HbA1c',
      classCode: 'VR',
    },
  ],
};

export const EMPTY_HEALTH_RECORDS: HealthRecords = {
  vitals: [],
  conditions: [],
  allergies: [],
  lastScan: { title: '—', facility: '—', address: '—', date: '—' },
  cholesterol: [],
  medications: [],
  observations: [],
  encounters: [],
};

/** @deprecated Prefer useHealthRecords() — returns mock only for demo mode. */
export function getHealthRecords(): HealthRecords {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return MOCK_HEALTH_RECORDS;
  return EMPTY_HEALTH_RECORDS;
}
