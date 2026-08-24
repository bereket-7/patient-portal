export type VitalMetric = {
  id: string;
  label: string;
  value: string;
  unit: string;
  date: string;
  color: string;
};

export type ConditionRecord = {
  id: string;
  name: string;
  period: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Complaint';
};

export type LastScan = {
  title: string;
  facility: string;
  address: string;
  date: string;
};

/** FHIR Encounter summary row (HealthEx clinical bundle). */
export type EncounterRecord = {
  id: string;
  type: string;
  date: string;
  status: string;
  facility?: string;
  provider?: string;
  reason?: string;
  classCode?: string;
};

export type CholesterolReading = {
  year: string;
  value: number;
  inRange: boolean;
};

export type MedicationRecord = {
  id: string;
  name: string;
  dosage: string;
  status: string;
  prescribedDate: string;
};

export type ObservationRecord = {
  id: string;
  name: string;
  value: string;
  date: string;
  status: string;
};

export type HealthRecords = {
  vitals: VitalMetric[];
  conditions: ConditionRecord[];
  allergies: string[];
  lastScan: LastScan;
  cholesterol: CholesterolReading[];
  medications: MedicationRecord[];
  observations: ObservationRecord[];
  encounters: EncounterRecord[];
};
