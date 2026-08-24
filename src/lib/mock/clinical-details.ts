export type ConditionDetail = {
  id: string;
  name: string;
  period: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Complaint';
  status: string;
  icd10: string;
  snomed: string;
  onset: string;
  recordedBy: string;
  clinicalStatus: string;
  verificationStatus: string;
  notes: string;
  relatedMedications: string[];
  carePlan: string[];
  category: string;
  bodySystem: string;
  lastReviewed: string;
  nextReview: string;
  facility: string;
  sourceSystem: string;
  symptoms: string[];
  differentials: string[];
  timeline: Array<{ date: string; title: string; detail?: string }>;
  relatedLabIds: string[];
  relatedEncounterIds: string[];
  relatedMedicationIds: string[];
  documents: Array<{ name: string; date: string; type: string }>;
  providerCommentary: string;
};

export type MedicationDetail = {
  id: string;
  name: string;
  dosage: string;
  status: string;
  prescribedDate: string;
  rxNorm: string;
  route: string;
  frequency: string;
  prescriber: string;
  indication: string;
  pharmacy: string;
  refillsRemaining: number;
  startDate: string;
  instructions: string;
  sideEffects: string[];
  interactions: string[];
  ndc: string;
  strength: string;
  form: string;
  daysSupply: number;
  lastFilled: string;
  nextFillDue: string;
  adherence: string;
  monitoring: string[];
  contraindications: string[];
  timeline: Array<{ date: string; title: string; detail?: string }>;
  relatedConditionIds: string[];
  relatedLabIds: string[];
  counselingPoints: string[];
  providerCommentary: string;
};

export type LabDetail = {
  id: string;
  name: string;
  value: string;
  date: string;
  status: string;
  loinc: string;
  referenceRange: string;
  interpretation: string;
  specimen: string;
  performingLab: string;
  orderedBy: string;
  notes: string;
  history: Array<{ date: string; value: string }>;
  units: string;
  collectionTime: string;
  receivedTime: string;
  reportedTime: string;
  fasting: boolean;
  criticalFlag: boolean;
  analyticMethod: string;
  analyzer: string;
  clinicalSignificance: string;
  recommendations: string[];
  relatedConditionIds: string[];
  relatedMedicationIds: string[];
  timeline: Array<{ date: string; title: string; detail?: string }>;
  providerCommentary: string;
};

export type VitalDetail = {
  id: string;
  label: string;
  value: string;
  unit: string;
  date: string;
  color: string;
  method: string;
  recordedBy: string;
  location: string;
  trend: string;
  reference: string;
  notes: string;
  history: Array<{ date: string; value: string }>;
  position: string;
  device: string;
  quality: string;
  clinicalSignificance: string;
  recommendations: string[];
  relatedConditionIds: string[];
  relatedMedicationIds: string[];
  timeline: Array<{ date: string; title: string; detail?: string }>;
  providerCommentary: string;
};

export type EncounterDetail = {
  id: string;
  type: string;
  facility: string;
  date: string;
  reason: string;
  status: string;
  practitioner: string;
  department: string;
  duration: string;
  chiefComplaint: string;
  assessment: string;
  plan: string[];
  followUp: string;
  location: string;
  encounterClass: string;
  priority: string;
  diagnoses: string[];
  vitalsSummary: string;
  orders: string[];
  medicationsDiscussed: string[];
  timeline: Array<{ date: string; title: string; detail?: string }>;
  relatedConditionIds: string[];
  relatedProcedureIds: string[];
  relatedLabIds: string[];
  documents: Array<{ name: string; date: string; type: string }>;
  providerCommentary: string;
};

export type ProcedureDetail = {
  id: string;
  name: string;
  date: string;
  performer: string;
  status: string;
  code: string;
  bodySite: string;
  indication: string;
  findings: string;
  reportSummary: string;
  facility: string;
  laterality: string;
  anesthesia: string;
  complications: string;
  devices: string[];
  followUpInstructions: string[];
  relatedEncounterIds: string[];
  relatedConditionIds: string[];
  timeline: Array<{ date: string; title: string; detail?: string }>;
  documents: Array<{ name: string; date: string; type: string }>;
  providerCommentary: string;
};

export type AllergyDetail = {
  id: string;
  name: string;
  criticality: string;
  category: string;
  reaction: string;
  onset: string;
  recordedBy: string;
  verification: string;
  notes: string;
  severity: string;
  manifestation: string;
  exposureRoute: string;
  lastOccurrence: string;
  avoidanceAdvice: string[];
  relatedMedicationIds: string[];
  timeline: Array<{ date: string; title: string; detail?: string }>;
  providerCommentary: string;
};

export const CONDITION_DETAILS: ConditionDetail[] = [
  {
    id: '1',
    name: 'Night Vision Impairment',
    period: '12 Jan 2025',
    severity: 'Complaint',
    status: 'Active',
    icd10: 'H53.60',
    snomed: '246636008',
    onset: '12 Jan 2025',
    recordedBy: 'Dr. Amira Patel, MD',
    clinicalStatus: 'Active',
    verificationStatus: 'Confirmed',
    notes:
      'Patient reports difficulty with night driving and dim lighting. Recommend ophthalmology referral and visual field testing.',
    relatedMedications: [],
    carePlan: ['Ophthalmology consult', 'Avoid night driving until evaluated', 'Repeat acuity in 90 days'],
    category: 'Symptom / Sensory',
    bodySystem: 'Eyes / Visual pathway',
    lastReviewed: '04 Jul 2026',
    nextReview: '04 Oct 2026',
    facility: 'NewAge Hospital — Neurology',
    sourceSystem: 'Epic EHR',
    symptoms: [
      'Reduced acuity in low light',
      'Halos around headlights',
      'Delayed dark adaptation',
      'Mild glare sensitivity',
    ],
    differentials: [
      'Cataract (early)',
      'Vitamin A deficiency',
      'Retinitis pigmentosa (atypical)',
      'Medication-related visual side effect',
      'Uncorrected refractive error',
    ],
    timeline: [
      {
        date: '12 Jan 2025',
        title: 'Symptom onset documented',
        detail: 'Patient described night driving difficulty over prior 3–4 weeks.',
      },
      {
        date: '12 Jan 2025',
        title: 'Primary care assessment',
        detail: 'Snellen 20/25 OU; fundoscopic exam deferred to ophthalmology.',
      },
      {
        date: '04 Jul 2026',
        title: 'Follow-up review',
        detail: 'Symptoms persist; ophthalmology referral reinforced.',
      },
    ],
    relatedLabIds: [],
    relatedEncounterIds: ['e1'],
    relatedMedicationIds: [],
    documents: [
      { name: 'Ophthalmology referral letter', date: '04 Jul 2026', type: 'Referral' },
      { name: 'Visual symptom questionnaire', date: '12 Jan 2025', type: 'Form' },
    ],
    providerCommentary:
      'Complaint is clinically meaningful for driving safety. Prioritize formal ophthalmology evaluation before attributing to refractive error alone. No current medication strongly implicated.',
  },
  {
    id: '2',
    name: 'Urinary Tract Infection',
    period: '03 Mar 2024',
    severity: 'Severe',
    status: 'Resolved',
    icd10: 'N39.0',
    snomed: '68566005',
    onset: '01 Mar 2024',
    recordedBy: 'Dr. Luis Ortega, MD',
    clinicalStatus: 'Resolved',
    verificationStatus: 'Confirmed',
    notes:
      'Culture-positive UTI treated with culture-directed antibiotics. Symptoms resolved; no recurrence documented.',
    relatedMedications: [],
    carePlan: ['Completed antibiotic course', 'Hydration counseling', 'Return if fever recurs'],
    category: 'Infectious',
    bodySystem: 'Genitourinary',
    lastReviewed: '20 Mar 2024',
    nextReview: 'As needed',
    facility: 'NewAge Hospital — Urgent Care',
    sourceSystem: 'Epic EHR',
    symptoms: [
      'Dysuria',
      'Urinary frequency',
      'Suprapubic discomfort',
      'Low-grade fever (38.1°C)',
      'Cloudy urine',
    ],
    differentials: [
      'Pyelonephritis',
      'Interstitial cystitis',
      'Sexually transmitted infection',
      'Vaginitis',
      'Nephrolithiasis with secondary infection',
    ],
    timeline: [
      {
        date: '01 Mar 2024',
        title: 'Symptom onset',
        detail: 'Dysuria and frequency began overnight.',
      },
      {
        date: '03 Mar 2024',
        title: 'Urgent care visit & culture',
        detail: 'UA positive for LE/nitrites; urine culture ordered; empiric therapy started.',
      },
      {
        date: '05 Mar 2024',
        title: 'Culture results',
        detail: 'E. coli >100k CFU; sensitive to prescribed agent.',
      },
      {
        date: '12 Mar 2024',
        title: 'Clinical resolution',
        detail: 'Symptoms fully resolved; no residual hematuria.',
      },
      {
        date: '20 Mar 2024',
        title: 'Condition closed',
        detail: 'Marked resolved; no follow-up culture indicated.',
      },
    ],
    relatedLabIds: [],
    relatedEncounterIds: [],
    relatedMedicationIds: [],
    documents: [
      { name: 'Urine culture report', date: '05 Mar 2024', type: 'Lab report' },
      { name: 'Urgent care visit note', date: '03 Mar 2024', type: 'Clinical note' },
      { name: 'Antibiotic counseling sheet', date: '03 Mar 2024', type: 'Patient education' },
    ],
    providerCommentary:
      'Classic culture-confirmed cystitis with complete resolution. No recurrent pattern to date. Reassess if ≥2 symptomatic UTIs in 6 months for prophylaxis discussion.',
  },
  {
    id: '3',
    name: 'Hypertension',
    period: '18 Aug 2023',
    severity: 'Moderate',
    status: 'Active',
    icd10: 'I10',
    snomed: '38341003',
    onset: '18 Aug 2023',
    recordedBy: 'Dr. Amira Patel, MD',
    clinicalStatus: 'Active',
    verificationStatus: 'Confirmed',
    notes:
      'Essential hypertension managed with ACE inhibitor. Home BP log shows improvement; continue lifestyle measures.',
    relatedMedications: ['Lisinopril'],
    carePlan: ['Continue Lisinopril 10mg daily', 'Low-sodium diet', 'Home BP monitoring 3x/week'],
    category: 'Chronic / Cardiovascular',
    bodySystem: 'Cardiovascular',
    lastReviewed: '04 Jul 2026',
    nextReview: '04 Oct 2026',
    facility: 'NewAge Hospital — Primary Care',
    sourceSystem: 'Epic EHR',
    symptoms: [
      'Occasional morning headache (historical)',
      'No chest pain',
      'No dyspnea at rest',
      'No syncope',
    ],
    differentials: [
      'Secondary hypertension (renovascular)',
      'White-coat hypertension',
      'Primary aldosteronism',
      'Obstructive sleep apnea contribution',
      'Medication-induced BP elevation',
    ],
    timeline: [
      {
        date: '18 Aug 2023',
        title: 'Diagnosis established',
        detail: 'Office BP 148/92; confirmed on repeat; ECG ordered.',
      },
      {
        date: '18 Aug 2023',
        title: 'Lisinopril started',
        detail: 'Initiated 10 mg daily with counseling on cough and hyperkalemia.',
      },
      {
        date: '12 Mar 2026',
        title: 'Interim visit',
        detail: 'Clinic BP 136/86; adherence good; lifestyle counseling reinforced.',
      },
      {
        date: '04 Jul 2026',
        title: 'Most recent review',
        detail: 'Clinic BP 130/84; trending toward goal; continue current regimen.',
      },
    ],
    relatedLabIds: ['1', '3'],
    relatedEncounterIds: ['e1'],
    relatedMedicationIds: ['1'],
    documents: [
      { name: 'Home BP log (PDF)', date: '01 Jul 2026', type: 'Patient-reported' },
      { name: 'Hypertension care plan', date: '18 Aug 2023', type: 'Care plan' },
      { name: 'Baseline ECG report', date: '18 Aug 2023', type: 'Procedure report' },
    ],
    providerCommentary:
      'Well-controlled essential hypertension on ACE inhibitor monotherapy. Systolic remains near Stage 1 threshold — reinforce home monitoring and sodium restriction. Consider titration only if average home SBP remains ≥130.',
  },
  {
    id: '4',
    name: 'Seasonal Allergic Rhinitis',
    period: '05 Apr 2022',
    severity: 'Mild',
    status: 'Active',
    icd10: 'J30.2',
    snomed: '367807001',
    onset: '05 Apr 2022',
    recordedBy: 'Dr. Amira Patel, MD',
    clinicalStatus: 'Active',
    verificationStatus: 'Confirmed',
    notes: 'Seasonal symptoms in spring. Managed with antihistamines as needed.',
    relatedMedications: [],
    carePlan: ['PRN antihistamine', 'Allergen avoidance education'],
    category: 'Allergic / Immunologic',
    bodySystem: 'Respiratory / ENT',
    lastReviewed: '05 Apr 2025',
    nextReview: 'Spring 2027 or sooner if uncontrolled',
    facility: 'NewAge Hospital — Primary Care',
    sourceSystem: 'Epic EHR',
    symptoms: [
      'Sneezing',
      'Rhinorrhea',
      'Nasal congestion',
      'Itchy eyes',
      'Seasonal pattern (March–May)',
    ],
    differentials: [
      'Non-allergic rhinitis',
      'Chronic sinusitis',
      'Viral URI',
      'Medication-induced rhinitis',
      'Vasomotor rhinitis',
    ],
    timeline: [
      {
        date: '05 Apr 2022',
        title: 'Diagnosis recorded',
        detail: 'Spring pollen season symptoms; exam showed pale turbinates.',
      },
      {
        date: '12 Apr 2023',
        title: 'Seasonal flare',
        detail: 'PRN loratadine effective; no asthma symptoms.',
      },
      {
        date: '05 Apr 2025',
        title: 'Annual review',
        detail: 'Mild intermittent symptoms; no escalation to daily therapy needed.',
      },
    ],
    relatedLabIds: [],
    relatedEncounterIds: [],
    relatedMedicationIds: [],
    documents: [
      { name: 'Allergen avoidance handout', date: '05 Apr 2022', type: 'Patient education' },
    ],
    providerCommentary:
      'Mild seasonal allergic rhinitis with predictable spring pattern. OTC/PRN antihistamine is appropriate. Escalate to intranasal corticosteroid if symptoms interfere with sleep or daily function.',
  },
];

export const MEDICATION_DETAILS: MedicationDetail[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg daily',
    status: 'Active',
    prescribedDate: '18 Aug 2023',
    rxNorm: '314076',
    route: 'Oral',
    frequency: 'Once daily',
    prescriber: 'Dr. Amira Patel, MD',
    indication: 'Hypertension',
    pharmacy: 'CVS Pharmacy — Beacon Hill',
    refillsRemaining: 2,
    startDate: '18 Aug 2023',
    instructions: 'Take one tablet by mouth every morning. Monitor blood pressure.',
    sideEffects: ['Dry cough', 'Dizziness', 'Hyperkalemia (rare)'],
    interactions: ['NSAIDs may reduce effect', 'Potassium supplements — monitor levels'],
    ndc: '68180-0512-01',
    strength: '10 mg',
    form: 'Tablet',
    daysSupply: 90,
    lastFilled: '10 Apr 2026',
    nextFillDue: '09 Jul 2026',
    adherence: 'Good (~94% PDC last 12 months)',
    monitoring: [
      'Blood pressure (clinic + home)',
      'Serum potassium',
      'Serum creatinine / eGFR',
      'Symptoms of angioedema or persistent cough',
    ],
    contraindications: [
      'History of ACE inhibitor–related angioedema',
      'Pregnancy',
      'Bilateral renal artery stenosis',
      'Hyperkalemia (uncontrolled)',
    ],
    timeline: [
      {
        date: '18 Aug 2023',
        title: 'Initial prescription',
        detail: 'Started 10 mg PO daily for essential hypertension.',
      },
      {
        date: '20 Sep 2023',
        title: '2-week tolerance check',
        detail: 'No cough; mild orthostasis resolved; BMP normal.',
      },
      {
        date: '10 Apr 2026',
        title: 'Most recent fill',
        detail: '90-day supply dispensed at CVS Beacon Hill.',
      },
      {
        date: '04 Jul 2026',
        title: 'Therapy review',
        detail: 'Continue current dose; BP improving toward goal.',
      },
    ],
    relatedConditionIds: ['3'],
    relatedLabIds: ['1', '3'],
    counselingPoints: [
      'Take at the same time each morning',
      'Rise slowly from sitting to reduce dizziness',
      'Report persistent dry cough or facial swelling immediately',
      'Avoid high-dose NSAIDs without clinician approval',
      'Do not use potassium supplements unless directed',
    ],
    providerCommentary:
      'First-line ACE inhibitor with good adherence and improving BP control. No cough reported. Next BMP with routine labs; no dose change indicated at present.',
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg twice daily',
    status: 'Active',
    prescribedDate: '10 Jan 2024',
    rxNorm: '860975',
    route: 'Oral',
    frequency: 'Twice daily with meals',
    prescriber: 'Dr. Amira Patel, MD',
    indication: 'Glycemic control / metabolic support',
    pharmacy: 'CVS Pharmacy — Beacon Hill',
    refillsRemaining: 1,
    startDate: '10 Jan 2024',
    instructions: 'Take with breakfast and dinner. Do not crush extended tablets if switched.',
    sideEffects: ['GI upset', 'Metallic taste'],
    interactions: ['Iodinated contrast — hold peri-procedure'],
    ndc: '0093-7214-01',
    strength: '500 mg',
    form: 'Tablet (immediate release)',
    daysSupply: 30,
    lastFilled: '15 Jun 2026',
    nextFillDue: '15 Jul 2026',
    adherence: 'Fair–good (~86% PDC); occasional missed evening dose',
    monitoring: [
      'HbA1c every 3–6 months',
      'Fasting glucose',
      'eGFR (hold if <30)',
      'Vitamin B12 periodically with long-term use',
      'GI tolerability',
    ],
    contraindications: [
      'eGFR < 30 mL/min/1.73m²',
      'Acute metabolic acidosis / lactic acidosis risk',
      'Severe hepatic impairment',
      'Acute dehydration / hypoxia states',
    ],
    timeline: [
      {
        date: '10 Jan 2024',
        title: 'Initiated therapy',
        detail: 'Started for rising A1c / metabolic risk; titrated to BID.',
      },
      {
        date: '01 Jun 2026',
        title: 'A1c check',
        detail: 'HbA1c 5.8% — prediabetes range; continue lifestyle + metformin.',
      },
      {
        date: '15 Jun 2026',
        title: 'Refill',
        detail: '30-day fill; 1 refill remaining on current Rx.',
      },
    ],
    relatedConditionIds: [],
    relatedLabIds: ['1', '2'],
    counselingPoints: [
      'Always take with food to reduce GI upset',
      'Do not skip meals after dosing',
      'Hold around iodinated contrast procedures as instructed',
      'Report severe diarrhea, muscle pain, or unexplained weakness',
      'Alcohol in excess increases lactic acidosis risk',
    ],
    providerCommentary:
      'Appropriate for borderline glycemic elevation. GI tolerability acceptable. Reinforce evening-dose adherence. Reassess need if sustained lifestyle gains normalize A1c.',
  },
  {
    id: '3',
    name: 'Atorvastatin',
    dosage: '20mg daily',
    status: 'Active',
    prescribedDate: '22 Feb 2025',
    rxNorm: '617314',
    route: 'Oral',
    frequency: 'Once daily at bedtime',
    prescriber: 'Dr. Amira Patel, MD',
    indication: 'Lipid management',
    pharmacy: 'CVS Pharmacy — Beacon Hill',
    refillsRemaining: 3,
    startDate: '22 Feb 2025',
    instructions: 'Take at bedtime. Report unexplained muscle pain.',
    sideEffects: ['Myalgia', 'Elevated LFTs (monitor)'],
    interactions: ['Grapefruit juice — avoid large amounts'],
    ndc: '0071-0156-23',
    strength: '20 mg',
    form: 'Tablet',
    daysSupply: 90,
    lastFilled: '22 May 2026',
    nextFillDue: '20 Aug 2026',
    adherence: 'Excellent (~98% PDC)',
    monitoring: [
      'Fasting lipid panel',
      'ALT/AST at baseline and if symptoms',
      'CK if unexplained myalgia',
      'Symptoms of myopathy / rhabdomyolysis',
    ],
    contraindications: [
      'Active liver disease',
      'Unexplained persistent LFT elevations',
      'Pregnancy / breastfeeding',
      'Hypersensitivity to atorvastatin',
    ],
    timeline: [
      {
        date: '22 Feb 2025',
        title: 'Started atorvastatin 20 mg',
        detail: 'Total cholesterol 210 mg/dL; ASCVD risk discussion completed.',
      },
      {
        date: '01 Jun 2026',
        title: 'Lipid recheck',
        detail: 'Total cholesterol improved to 185 mg/dL on therapy.',
      },
      {
        date: '22 May 2026',
        title: '90-day refill',
        detail: 'No myalgia reported; continue current dose.',
      },
    ],
    relatedConditionIds: [],
    relatedLabIds: ['3', '4'],
    counselingPoints: [
      'Take at bedtime for consistency',
      'Report unexplained muscle pain, tenderness, or weakness',
      'Limit grapefruit juice intake',
      'Continue heart-healthy diet and exercise',
      'Do not stop suddenly without discussing with clinician',
    ],
    providerCommentary:
      'Clear lipid response to moderate-intensity statin. No myalgia or hepatic concerns reported. Continue 20 mg; next lipids with metabolic panel in ~3 months.',
  },
];

export const LAB_DETAILS: LabDetail[] = [
  {
    id: '1',
    name: 'Glucose',
    value: '95 mg/dL',
    date: '03 Jul 2026',
    status: 'Final',
    loinc: '2345-7',
    referenceRange: '70–99 mg/dL (fasting)',
    interpretation: 'Normal',
    specimen: 'Serum',
    performingLab: 'Quest Diagnostics — Back Bay',
    orderedBy: 'Dr. Amira Patel, MD',
    notes: 'Fasting sample. Within reference range.',
    history: [
      { date: '01 Jun 2026', value: '98 mg/dL' },
      { date: '12 Mar 2026', value: '102 mg/dL' },
      { date: '03 Jul 2026', value: '95 mg/dL' },
    ],
    units: 'mg/dL',
    collectionTime: '03 Jul 2026 07:42',
    receivedTime: '03 Jul 2026 08:15',
    reportedTime: '03 Jul 2026 10:03',
    fasting: true,
    criticalFlag: false,
    analyticMethod: 'Hexokinase / spectrophotometry',
    analyzer: 'Roche Cobas c503',
    clinicalSignificance:
      'Fasting glucose is within the normal range and improved versus the March value that briefly exceeded 100 mg/dL. Supports stable glycemic control on current regimen.',
    recommendations: [
      'Continue current diet and metformin adherence',
      'Recheck fasting glucose with next metabolic panel',
      'Correlate with HbA1c trend',
    ],
    relatedConditionIds: [],
    relatedMedicationIds: ['2'],
    timeline: [
      {
        date: '12 Mar 2026',
        title: 'Prior result elevated',
        detail: '102 mg/dL — just above fasting normal.',
      },
      {
        date: '01 Jun 2026',
        title: 'Interim result',
        detail: '98 mg/dL — returned to reference range.',
      },
      {
        date: '03 Jul 2026',
        title: 'Current result',
        detail: '95 mg/dL fasting — normal.',
      },
    ],
    providerCommentary:
      'Reassuring fasting glucose. No action needed beyond continued lifestyle measures and scheduled A1c surveillance.',
  },
  {
    id: '2',
    name: 'HbA1c',
    value: '5.8 %',
    date: '01 Jun 2026',
    status: 'Final',
    loinc: '4548-4',
    referenceRange: '< 5.7% normal · 5.7–6.4% prediabetes',
    interpretation: 'Prediabetes range — monitor',
    specimen: 'Whole blood',
    performingLab: 'Quest Diagnostics — Back Bay',
    orderedBy: 'Dr. Amira Patel, MD',
    notes: 'Borderline elevation. Lifestyle counseling reinforced.',
    history: [
      { date: '10 Jan 2025', value: '5.6 %' },
      { date: '01 Jun 2026', value: '5.8 %' },
    ],
    units: '%',
    collectionTime: '01 Jun 2026 08:05',
    receivedTime: '01 Jun 2026 08:40',
    reportedTime: '01 Jun 2026 14:22',
    fasting: false,
    criticalFlag: false,
    analyticMethod: 'HPLC (NGSP-certified)',
    analyzer: 'Bio-Rad D-100',
    clinicalSignificance:
      'Value is in the prediabetes band and has risen slightly from 5.6% (Jan 2025). Indicates early glycemic dysregulation warranting continued metformin and lifestyle focus rather than escalation to additional agents.',
    recommendations: [
      'Reinforce carbohydrate moderation and activity goals',
      'Continue metformin if tolerated',
      'Repeat HbA1c in 3–6 months',
      'Screen for diabetes-related complications only if progression continues',
    ],
    relatedConditionIds: [],
    relatedMedicationIds: ['2'],
    timeline: [
      {
        date: '10 Jan 2025',
        title: 'Prior HbA1c',
        detail: '5.6% — upper-normal / near threshold.',
      },
      {
        date: '01 Jun 2026',
        title: 'Current HbA1c',
        detail: '5.8% — prediabetes range; counseling documented.',
      },
    ],
    providerCommentary:
      'Mild upward drift into prediabetes range. Not urgent, but meaningful for prevention counseling. Pair with fasting glucose and weight trends at next visit.',
  },
  {
    id: '3',
    name: 'Total Cholesterol',
    value: '185 mg/dL',
    date: '01 Jun 2026',
    status: 'Final',
    loinc: '2093-3',
    referenceRange: '< 200 mg/dL desirable',
    interpretation: 'Desirable',
    specimen: 'Serum',
    performingLab: 'Quest Diagnostics — Back Bay',
    orderedBy: 'Dr. Amira Patel, MD',
    notes: 'Improved vs prior year on statin therapy.',
    history: [
      { date: '22 Feb 2025', value: '210 mg/dL' },
      { date: '01 Jun 2026', value: '185 mg/dL' },
    ],
    units: 'mg/dL',
    collectionTime: '01 Jun 2026 08:05',
    receivedTime: '01 Jun 2026 08:40',
    reportedTime: '01 Jun 2026 15:10',
    fasting: true,
    criticalFlag: false,
    analyticMethod: 'Enzymatic colorimetric',
    analyzer: 'Roche Cobas c503',
    clinicalSignificance:
      'Total cholesterol has declined from 210 to 185 mg/dL after starting atorvastatin, consistent with expected pharmacologic response and reduced ASCVD risk trajectory.',
    recommendations: [
      'Continue atorvastatin 20 mg daily',
      'Maintain heart-healthy diet',
      'Recheck fasting lipids in 3 months',
      'Review LDL-C component when full panel available',
    ],
    relatedConditionIds: ['3'],
    relatedMedicationIds: ['3'],
    timeline: [
      {
        date: '22 Feb 2025',
        title: 'Pre-statin baseline',
        detail: '210 mg/dL — prompted atorvastatin initiation.',
      },
      {
        date: '01 Jun 2026',
        title: 'On-therapy result',
        detail: '185 mg/dL — desirable range achieved.',
      },
    ],
    providerCommentary:
      'Favorable response to moderate-intensity statin. No dose increase needed unless LDL target not met on full lipid panel review.',
  },
  {
    id: '4',
    name: 'HDL Cholesterol',
    value: '55 mg/dL',
    date: '01 Jun 2026',
    status: 'Final',
    loinc: '2085-9',
    referenceRange: '≥ 50 mg/dL (female)',
    interpretation: 'At goal',
    specimen: 'Serum',
    performingLab: 'Quest Diagnostics — Back Bay',
    orderedBy: 'Dr. Amira Patel, MD',
    notes: 'HDL within protective range.',
    history: [
      { date: '2015', value: '52 mg/dL' },
      { date: '2016', value: '55 mg/dL' },
      { date: '01 Jun 2026', value: '55 mg/dL' },
    ],
    units: 'mg/dL',
    collectionTime: '01 Jun 2026 08:05',
    receivedTime: '01 Jun 2026 08:40',
    reportedTime: '01 Jun 2026 15:10',
    fasting: true,
    criticalFlag: false,
    analyticMethod: 'Homogeneous enzymatic colorimetric',
    analyzer: 'Roche Cobas c503',
    clinicalSignificance:
      'HDL remains at or above the protective threshold for adult females and is stable longitudinally, supporting overall favorable lipid risk profile alongside improved total cholesterol.',
    recommendations: [
      'Continue aerobic activity to maintain HDL',
      'Avoid smoking',
      'No pharmacologic HDL-raising therapy indicated',
      'Interpret alongside LDL and non-HDL on next panel',
    ],
    relatedConditionIds: [],
    relatedMedicationIds: ['3'],
    timeline: [
      {
        date: '2015',
        title: 'Historical HDL',
        detail: '52 mg/dL — already near goal.',
      },
      {
        date: '01 Jun 2026',
        title: 'Current HDL',
        detail: '55 mg/dL — at goal; stable.',
      },
    ],
    providerCommentary:
      'Stable protective HDL. Focus remains on LDL/non-HDL reduction and lifestyle rather than HDL-targeted therapy.',
  },
];

export const VITAL_DETAILS: VitalDetail[] = [
  {
    id: 'bmi',
    label: 'BMI',
    value: '22.17',
    unit: 'kg/m²',
    date: '04 Jul 2026',
    color: 'bg-vital-bmi',
    method: 'Calculated from height/weight',
    recordedBy: 'Medical assistant — NewAge Hospital',
    location: 'Outpatient clinic',
    trend: 'Stable',
    reference: '18.5–24.9 normal',
    notes: 'Within normal BMI range.',
    history: [
      { date: '12 Mar 2026', value: '22.4' },
      { date: '04 Jul 2026', value: '22.17' },
    ],
    position: 'Standing (height/weight)',
    device: 'Seca 284 measuring station',
    quality: 'Valid — shoes removed, light clothing',
    clinicalSignificance:
      'BMI is within the normal range and essentially unchanged since March, indicating stable nutritional status without underweight or obesity risk.',
    recommendations: [
      'Continue current diet and activity pattern',
      'Recalculate BMI at each outpatient visit',
      'No weight-management referral indicated',
    ],
    relatedConditionIds: [],
    relatedMedicationIds: ['2'],
    timeline: [
      {
        date: '12 Mar 2026',
        title: 'Prior BMI',
        detail: '22.4 kg/m² — normal.',
      },
      {
        date: '04 Jul 2026',
        title: 'Current BMI',
        detail: '22.17 kg/m² — stable normal.',
      },
    ],
    providerCommentary:
      'Healthy BMI with no concerning trend. Useful context for interpreting BP and metabolic labs.',
  },
  {
    id: 'bp',
    label: 'Blood Pressure',
    value: '130/84',
    unit: 'mmHg',
    date: '04 Jul 2026',
    color: 'bg-vital-bp',
    method: 'Automated cuff, seated',
    recordedBy: 'Medical assistant — NewAge Hospital',
    location: 'Outpatient clinic',
    trend: 'Improved on therapy',
    reference: '< 130/80 goal for many adults',
    notes: 'Stage 1 range systolic; continue ACE inhibitor and monitoring.',
    history: [
      { date: '18 Aug 2023', value: '148/92' },
      { date: '12 Mar 2026', value: '136/86' },
      { date: '04 Jul 2026', value: '130/84' },
    ],
    position: 'Seated, arm supported at heart level',
    device: 'Omron HEM-907XL',
    quality: 'Valid — rest ≥5 min; appropriate cuff size; average of 2 readings',
    clinicalSignificance:
      'Office BP has improved substantially from diagnostic baseline of 148/92. Current 130/84 remains near treatment goal; diastolic still slightly above common <80 target.',
    recommendations: [
      'Continue lisinopril 10 mg daily',
      'Home BP log 3×/week (morning)',
      'Low-sodium diet counseling',
      'Consider dose titration if average home SBP ≥130',
    ],
    relatedConditionIds: ['3'],
    relatedMedicationIds: ['1'],
    timeline: [
      {
        date: '18 Aug 2023',
        title: 'Diagnostic elevation',
        detail: '148/92 — hypertension diagnosed; ACE inhibitor started.',
      },
      {
        date: '12 Mar 2026',
        title: 'Interim improvement',
        detail: '136/86 on therapy.',
      },
      {
        date: '04 Jul 2026',
        title: 'Most recent clinic BP',
        detail: '130/84 — approaching goal.',
      },
    ],
    providerCommentary:
      'Clear treatment response. Confirm with home averages before intensifying therapy; white-coat effect possible.',
  },
  {
    id: 'glucose',
    label: 'Glucose',
    value: '95',
    unit: 'mg/dL',
    date: '03 Jul 2026',
    color: 'bg-vital-glucose',
    method: 'Point-of-care / lab correlated',
    recordedBy: 'Quest Diagnostics',
    location: 'Lab draw',
    trend: 'Stable',
    reference: '70–99 fasting',
    notes: 'Fasting glucose normal.',
    history: [
      { date: '01 Jun 2026', value: '98' },
      { date: '03 Jul 2026', value: '95' },
    ],
    position: 'Seated phlebotomy',
    device: 'Roche Cobas (lab) / Contour Next (POC correlate)',
    quality: 'Valid fasting specimen — patient NPO ≥8 hours',
    clinicalSignificance:
      'Point-of-care / lab-correlated fasting glucose is normal and aligned with recent serum glucose, supporting stable short-term glycemic control.',
    recommendations: [
      'Continue current metabolic plan',
      'Correlate with HbA1c',
      'Repeat at next lab draw',
    ],
    relatedConditionIds: [],
    relatedMedicationIds: ['2'],
    timeline: [
      {
        date: '01 Jun 2026',
        title: 'Prior fasting glucose',
        detail: '98 mg/dL — normal.',
      },
      {
        date: '03 Jul 2026',
        title: 'Current value',
        detail: '95 mg/dL — stable normal.',
      },
    ],
    providerCommentary:
      'Consistent with serum glucose lab #1. No hypoglycemia or hyperglycemia concern today.',
  },
  {
    id: 'weight',
    label: 'Weight',
    value: '72.5',
    unit: 'kg',
    date: '04 Jul 2026',
    color: 'bg-vital-weight',
    method: 'Clinic scale',
    recordedBy: 'Medical assistant — NewAge Hospital',
    location: 'Outpatient clinic',
    trend: 'Stable',
    reference: 'Patient baseline ~72–74 kg',
    notes: 'No significant change.',
    history: [
      { date: '12 Mar 2026', value: '73.1' },
      { date: '04 Jul 2026', value: '72.5' },
    ],
    position: 'Standing',
    device: 'Seca 284',
    quality: 'Valid — calibrated scale; light clothing',
    clinicalSignificance:
      'Weight is stable within the patient baseline range. No unintentional loss or gain that would suggest medication intolerance, fluid shifts, or illness.',
    recommendations: [
      'Continue routine weight checks each visit',
      'Investigate if change ≥5% over 3–6 months',
      'Support current nutrition pattern',
    ],
    relatedConditionIds: [],
    relatedMedicationIds: ['2'],
    timeline: [
      {
        date: '12 Mar 2026',
        title: 'Prior weight',
        detail: '73.1 kg.',
      },
      {
        date: '04 Jul 2026',
        title: 'Current weight',
        detail: '72.5 kg — Δ −0.6 kg.',
      },
    ],
    providerCommentary:
      'Clinically insignificant change. Supports BMI stability and metformin GI tolerability.',
  },
  {
    id: 'heart',
    label: 'Heart Rate',
    value: '72',
    unit: 'bpm',
    date: '04 Jul 2026',
    color: 'bg-vital-heart',
    method: 'Pulse oximeter / ECG correlate',
    recordedBy: 'Medical assistant — NewAge Hospital',
    location: 'Outpatient clinic',
    trend: 'Stable',
    reference: '60–100 resting',
    notes: 'Regular rhythm.',
    history: [
      { date: '12 Mar 2026', value: '76' },
      { date: '04 Jul 2026', value: '72' },
    ],
    position: 'Seated, resting',
    device: 'Masimo Rad-97 / ECG strip correlate',
    quality: 'Valid resting HR — regular rhythm, no ectopy noted',
    clinicalSignificance:
      'Resting heart rate is normal and regular. Mild decrease from prior visit is within expected day-to-day variation and not suggestive of beta-blocker effect or arrhythmia.',
    recommendations: [
      'Continue routine vital monitoring',
      'Obtain ECG if palpitations, syncope, or irregular pulse',
      'No rate-control medication indicated',
    ],
    relatedConditionIds: ['3'],
    relatedMedicationIds: ['1'],
    timeline: [
      {
        date: '12 Mar 2026',
        title: 'Prior HR',
        detail: '76 bpm resting.',
      },
      {
        date: '04 Jul 2026',
        title: 'Current HR',
        detail: '72 bpm — regular.',
      },
    ],
    providerCommentary:
      'Normal resting rate supports stable cardiovascular exam. ACE inhibitor not expected to meaningfully alter HR.',
  },
  {
    id: 'spo2',
    label: 'SpO₂',
    value: '98',
    unit: '%',
    date: '04 Jul 2026',
    color: 'bg-vital-spo2',
    method: 'Pulse oximetry, room air',
    recordedBy: 'Medical assistant — NewAge Hospital',
    location: 'Outpatient clinic',
    trend: 'Stable',
    reference: '≥ 95% on room air',
    notes: 'Normal oxygenation.',
    history: [
      { date: '12 Mar 2026', value: '97' },
      { date: '04 Jul 2026', value: '98' },
    ],
    position: 'Seated, room air',
    device: 'Masimo Rad-97',
    quality: 'Valid — good waveform; warm digits; no nail polish',
    clinicalSignificance:
      'Oxygen saturation is normal on room air with a stable trend, arguing against acute cardiopulmonary compromise at the time of measurement.',
    recommendations: [
      'Routine SpO₂ with vitals is sufficient',
      'Investigate if SpO₂ < 94% or new dyspnea',
      'Correlate with chest imaging only if clinically indicated',
    ],
    relatedConditionIds: [],
    relatedMedicationIds: [],
    timeline: [
      {
        date: '12 Mar 2026',
        title: 'Prior SpO₂',
        detail: '97% on room air.',
      },
      {
        date: '04 Jul 2026',
        title: 'Current SpO₂',
        detail: '98% on room air.',
      },
    ],
    providerCommentary:
      'Normal oxygenation. Consistent with unremarkable chest radiograph from June.',
  },
];

export const ENCOUNTER_DETAILS: EncounterDetail[] = [
  {
    id: 'e1',
    type: 'Outpatient visit',
    facility: 'NewAge Hospital — Neurology',
    date: '04 Jul 2026',
    reason: 'Follow-up hypertension & vitals review',
    status: 'Finished',
    practitioner: 'Dr. Amira Patel, MD',
    department: 'Primary Care / Neurology',
    duration: '25 min',
    chiefComplaint: 'Routine follow-up; BP check',
    assessment: 'Hypertension improving on lisinopril. Night vision complaint noted — ophthalmology referral placed.',
    plan: ['Continue current meds', 'Ophthalmology referral', 'Repeat labs in 3 months'],
    followUp: '3 months or sooner if symptoms worsen',
    location: 'Clinic Room 214 — NewAge Hospital Outpatient Pavilion',
    encounterClass: 'Ambulatory',
    priority: 'Routine',
    diagnoses: [
      'Essential hypertension (I10) — improving',
      'Night vision impairment (H53.60) — active complaint',
      'Prediabetes risk / metabolic surveillance',
    ],
    vitalsSummary: 'BP 130/84, HR 72, SpO₂ 98%, weight 72.5 kg, BMI 22.17',
    orders: [
      'Ophthalmology referral — night vision',
      'BMP + lipids in 3 months',
      'Continue home BP monitoring',
    ],
    medicationsDiscussed: ['Lisinopril 10 mg daily', 'Metformin 500 mg BID', 'Atorvastatin 20 mg QHS'],
    timeline: [
      {
        date: '04 Jul 2026 09:05',
        title: 'Checked in',
        detail: 'Vitals obtained by MA.',
      },
      {
        date: '04 Jul 2026 09:20',
        title: 'Provider evaluation',
        detail: 'History, med review, focused neuro/ocular symptom discussion.',
      },
      {
        date: '04 Jul 2026 09:40',
        title: 'Orders & counseling',
        detail: 'Referral placed; after-visit summary provided.',
      },
      {
        date: '04 Jul 2026 09:45',
        title: 'Encounter closed',
        detail: 'Status Finished.',
      },
    ],
    relatedConditionIds: ['1', '3'],
    relatedProcedureIds: [],
    relatedLabIds: ['1', '2', '3'],
    documents: [
      { name: 'After-visit summary', date: '04 Jul 2026', type: 'AVS' },
      { name: 'Ophthalmology referral', date: '04 Jul 2026', type: 'Referral' },
      { name: 'Progress note', date: '04 Jul 2026', type: 'Clinical note' },
    ],
    providerCommentary:
      'Productive interval follow-up. HTN trajectory favorable; new visual complaint appropriately escalated. No acute findings requiring same-day workup beyond referral.',
  },
  {
    id: 'e2',
    type: 'Imaging',
    facility: 'NewAge Hospital — Radiology',
    date: '15 Jun 2026',
    reason: 'Chest X-Ray',
    status: 'Finished',
    practitioner: 'Dr. Luis Ortega, MD',
    department: 'Radiology',
    duration: '15 min',
    chiefComplaint: 'Pre-op / respiratory screening',
    assessment: 'Two-view chest radiograph completed.',
    plan: ['Report to referring clinician', 'No acute findings requiring action'],
    followUp: 'As clinically indicated',
    location: 'Radiology Suite B — NewAge Hospital',
    encounterClass: 'Ambulatory diagnostic',
    priority: 'Routine',
    diagnoses: ['Encounter for imaging (Z01.89)', 'No acute cardiopulmonary disease'],
    vitalsSummary: 'Not required for imaging encounter — patient ambulatory and stable',
    orders: ['Chest X-ray PA and lateral (CPT 71046)'],
    medicationsDiscussed: [],
    timeline: [
      {
        date: '15 Jun 2026 11:00',
        title: 'Arrival / registration',
      },
      {
        date: '15 Jun 2026 11:10',
        title: 'Images acquired',
        detail: 'Two-view CXR completed; technologist: S. Nguyen, RT.',
      },
      {
        date: '15 Jun 2026 14:30',
        title: 'Report finalized',
        detail: 'Interpreted by Dr. Luis Ortega.',
      },
    ],
    relatedConditionIds: [],
    relatedProcedureIds: ['p1'],
    relatedLabIds: [],
    documents: [
      { name: 'Chest X-ray report', date: '15 Jun 2026', type: 'Imaging report' },
      { name: 'DICOM study accession #CXR-662184', date: '15 Jun 2026', type: 'Imaging study' },
    ],
    providerCommentary:
      'Unremarkable screening CXR. Safe to clear from imaging perspective for planned outpatient procedures requiring respiratory screen.',
  },
  {
    id: 'e3',
    type: 'Lab draw',
    facility: 'Quest Diagnostics — Back Bay',
    date: '01 Jun 2026',
    reason: 'Metabolic panel & lipids',
    status: 'Finished',
    practitioner: 'Phlebotomy — Quest',
    department: 'Laboratory',
    duration: '10 min',
    chiefComplaint: 'Ordered labs',
    assessment: 'Specimen collected without complication.',
    plan: ['Results to ordering provider'],
    followUp: 'None',
    location: 'Quest PSC — 800 Boylston St, Back Bay',
    encounterClass: 'Ambulatory laboratory',
    priority: 'Routine',
    diagnoses: ['Laboratory examination (Z01.812)'],
    vitalsSummary: 'N/A — phlebotomy only',
    orders: [
      'Fasting glucose',
      'HbA1c',
      'Lipid panel (total + HDL cholesterol)',
    ],
    medicationsDiscussed: ['Metformin held morning dose until after draw per instruction'],
    timeline: [
      {
        date: '01 Jun 2026 07:50',
        title: 'Check-in',
        detail: 'Fasting confirmed (≥8 h).',
      },
      {
        date: '01 Jun 2026 08:05',
        title: 'Venipuncture',
        detail: 'Single stick; no hematoma.',
      },
      {
        date: '01 Jun 2026 15:10',
        title: 'Results released',
        detail: 'All ordered analytes finalized to Epic.',
      },
    ],
    relatedConditionIds: ['3'],
    relatedProcedureIds: [],
    relatedLabIds: ['2', '3', '4'],
    documents: [
      { name: 'Lab requisition', date: '01 Jun 2026', type: 'Order' },
      { name: 'Specimen collection record', date: '01 Jun 2026', type: 'Lab form' },
    ],
    providerCommentary:
      'Uneventful fasting draw. Results later showed desirable lipids and borderline A1c — reviewed at July visit.',
  },
];

export const PROCEDURE_DETAILS: ProcedureDetail[] = [
  {
    id: 'p1',
    name: 'Chest X-Ray (2 views)',
    date: '15 Jun 2026',
    performer: 'Dr. Luis Ortega',
    status: 'Completed',
    code: 'CPT 71046',
    bodySite: 'Chest',
    indication: 'Clinical evaluation',
    findings: 'No acute cardiopulmonary process. Heart size normal. Lungs clear.',
    reportSummary: 'Unremarkable two-view chest radiograph.',
    facility: 'NewAge Hospital — Radiology',
    laterality: 'Not applicable (thorax)',
    anesthesia: 'None',
    complications: 'None',
    devices: ['Digital radiography system — GE Definium 656 HD'],
    followUpInstructions: [
      'No activity restrictions',
      'Results sent to referring clinician',
      'Return if new cough, fever, or chest pain develops',
    ],
    relatedEncounterIds: ['e2'],
    relatedConditionIds: [],
    timeline: [
      {
        date: '15 Jun 2026 11:10',
        title: 'Images acquired',
        detail: 'PA and lateral views.',
      },
      {
        date: '15 Jun 2026 14:30',
        title: 'Final report signed',
        detail: 'Dr. Luis Ortega — no acute findings.',
      },
    ],
    documents: [
      { name: 'Radiology report', date: '15 Jun 2026', type: 'Imaging report' },
      { name: 'Image archive link', date: '15 Jun 2026', type: 'DICOM' },
    ],
    providerCommentary:
      'Normal study. Useful negative for acute process; does not evaluate chronic interstitial disease in detail — CT only if clinically warranted.',
  },
  {
    id: 'p2',
    name: 'ECG — 12 lead',
    date: '18 Aug 2023',
    performer: 'Dr. Amira Patel',
    status: 'Completed',
    code: 'CPT 93000',
    bodySite: 'Heart',
    indication: 'Hypertension workup',
    findings: 'Normal sinus rhythm. No acute ischemic changes.',
    reportSummary: 'Baseline ECG within normal limits.',
    facility: 'NewAge Hospital — Primary Care',
    laterality: 'Not applicable',
    anesthesia: 'None',
    complications: 'None',
    devices: ['GE MAC 2000 ECG machine'],
    followUpInstructions: [
      'No further cardiac testing required today',
      'Repeat ECG if chest pain, palpitations, or syncope',
      'Continue hypertension management',
    ],
    relatedEncounterIds: [],
    relatedConditionIds: ['3'],
    timeline: [
      {
        date: '18 Aug 2023',
        title: 'ECG performed',
        detail: 'Part of new hypertension workup.',
      },
      {
        date: '18 Aug 2023',
        title: 'Interpretation finalized',
        detail: 'NSR; no LVH criteria; no ischemia.',
      },
    ],
    documents: [
      { name: '12-lead ECG tracing PDF', date: '18 Aug 2023', type: 'Procedure report' },
      { name: 'ECG interpretation note', date: '18 Aug 2023', type: 'Clinical note' },
    ],
    providerCommentary:
      'Appropriate baseline ECG at HTN diagnosis. No LVH or ischemic changes; reassures against advanced hypertensive heart disease at presentation.',
  },
];

export const ALLERGY_DETAILS: AllergyDetail[] = [
  {
    id: 'a1',
    name: 'Allergenic Extract',
    criticality: 'Low',
    category: 'Medication',
    reaction: 'Local irritation',
    onset: 'Unknown',
    recordedBy: 'Dr. Amira Patel, MD',
    verification: 'Patient reported',
    notes: 'Avoid unless supervised immunotherapy setting.',
    severity: 'Mild',
    manifestation: 'Localized erythema and pruritus at injection site',
    exposureRoute: 'Subcutaneous / injection',
    lastOccurrence: 'Unknown — historical',
    avoidanceAdvice: [
      'Do not administer unsupervised allergenic extracts',
      'If immunotherapy indicated, use allergist-supervised protocol',
      'Document reaction in procedure consent if challenged',
    ],
    relatedMedicationIds: [],
    timeline: [
      {
        date: 'Unknown',
        title: 'Historical reaction',
        detail: 'Patient recalls local irritation after extract exposure.',
      },
      {
        date: '18 Aug 2023',
        title: 'Recorded in allergy list',
        detail: 'Added during medication reconciliation.',
      },
    ],
    providerCommentary:
      'Low-criticality local reaction. Not a barrier to most therapies, but avoid casual extract administration outside allergy specialty care.',
  },
  {
    id: 'a2',
    name: 'Penicillin',
    criticality: 'High',
    category: 'Medication',
    reaction: 'Rash / possible anaphylaxis history',
    onset: 'Childhood',
    recordedBy: 'Dr. Amira Patel, MD',
    verification: 'Confirmed',
    notes: 'Do not prescribe beta-lactam penicillins. Documented in allergy list.',
    severity: 'Severe',
    manifestation: 'Generalized urticarial rash; possible anaphylaxis (historical report)',
    exposureRoute: 'Oral',
    lastOccurrence: 'Childhood — approximate age 8',
    avoidanceAdvice: [
      'Avoid all penicillin-class antibiotics',
      'Use non-beta-lactam alternatives unless allergy tested',
      'Consider formal penicillin allergy evaluation / skin testing if future narrow-spectrum therapy needed',
      'Wear medical alert identification if history of anaphylaxis',
    ],
    relatedMedicationIds: [],
    timeline: [
      {
        date: 'Childhood',
        title: 'Index reaction',
        detail: 'Rash after oral penicillin; caregivers reported breathing difficulty.',
      },
      {
        date: '18 Aug 2023',
        title: 'Allergy list verified',
        detail: 'Confirmed with patient; marked High criticality.',
      },
    ],
    providerCommentary:
      'High-stakes historical penicillin allergy. Treat as true allergy until formal delabeling. Cross-reactivity counseling for cephalosporins should be case-by-case.',
  },
  {
    id: 'a3',
    name: 'Cashew nuts',
    criticality: 'High',
    category: 'Food',
    reaction: 'Urticaria',
    onset: 'Adult',
    recordedBy: 'Dr. Amira Patel, MD',
    verification: 'Patient reported',
    notes: 'Carry epinephrine if previously prescribed; avoid tree nuts when uncertain.',
    severity: 'Moderate–Severe',
    manifestation: 'Generalized urticaria; no documented airway compromise to date',
    exposureRoute: 'Oral ingestion',
    lastOccurrence: '2021 — restaurant exposure',
    avoidanceAdvice: [
      'Strict avoidance of cashews and cashew-containing products',
      'Exercise caution with mixed tree-nut products due to cross-contact',
      'Carry epinephrine auto-injector if prescribed',
      'Educate on reading labels and restaurant disclosure',
    ],
    relatedMedicationIds: [],
    timeline: [
      {
        date: '2021',
        title: 'Adult-onset reaction',
        detail: 'Urticaria after cashew exposure at restaurant.',
      },
      {
        date: '10 Jan 2024',
        title: 'Allergy list updated',
        detail: 'Criticality set to High; avoidance counseling documented.',
      },
    ],
    providerCommentary:
      'Significant food allergy with urticaria. No anaphylaxis documented yet — still counsel for epinephrine readiness and allergist referral if not already established.',
  },
  {
    id: 'a4',
    name: 'Latex',
    criticality: 'Moderate',
    category: 'Environment',
    reaction: 'Contact dermatitis',
    onset: 'Unknown',
    recordedBy: 'Dr. Amira Patel, MD',
    verification: 'Patient reported',
    notes: 'Use non-latex gloves in clinical settings.',
    severity: 'Moderate',
    manifestation: 'Contact dermatitis — erythema and itching of exposed skin',
    exposureRoute: 'Cutaneous / contact',
    lastOccurrence: '2022 — dental visit (latex gloves)',
    avoidanceAdvice: [
      'Request non-latex gloves and equipment in clinical settings',
      'Avoid latex balloons and elastic products when possible',
      'Alert surgical teams before procedures',
      'Consider cross-reactivity counseling for banana/avocado if symptoms arise',
    ],
    relatedMedicationIds: [],
    timeline: [
      {
        date: '2022',
        title: 'Documented contact reaction',
        detail: 'Dermatitis after latex glove exposure at dental office.',
      },
      {
        date: '18 Aug 2023',
        title: 'Charted as environmental allergy',
        detail: 'Moderate criticality; non-latex preference flagged.',
      },
    ],
    providerCommentary:
      'Contact-type latex sensitivity. Flag for procedures. No systemic reaction history, but still enforce latex-safe precautions.',
  },
  {
    id: 'a5',
    name: 'Sulfa drugs',
    criticality: 'Moderate',
    category: 'Medication',
    reaction: 'Rash',
    onset: 'Unknown',
    recordedBy: 'Dr. Amira Patel, MD',
    verification: 'Patient reported',
    notes: 'Avoid sulfonamide antibiotics.',
    severity: 'Moderate',
    manifestation: 'Maculopapular rash',
    exposureRoute: 'Oral',
    lastOccurrence: 'Unknown — adult years',
    avoidanceAdvice: [
      'Avoid sulfonamide antibiotics (e.g., TMP-SMX)',
      'Clarify non-antibiotic sulfonamides (e.g., some diuretics) with clinician case-by-case',
      'Document alternative antibiotic preferences',
      'Seek urgent care for rash with fever or mucosal involvement',
    ],
    relatedMedicationIds: [],
    timeline: [
      {
        date: 'Unknown',
        title: 'Historical rash',
        detail: 'Patient-reported rash after sulfa antibiotic.',
      },
      {
        date: '18 Aug 2023',
        title: 'Allergy list entry confirmed',
        detail: 'Moderate criticality; avoid sulfonamide antibiotics.',
      },
    ],
    providerCommentary:
      'Classic antibiotic sulfonamide rash history. Avoid TMP-SMX. Distinguish carefully from non-antibiotic sulfonamides which often remain acceptable.',
  },
];

export function getConditionDetail(id: string) {
  return CONDITION_DETAILS.find((c) => c.id === id) ?? null;
}

export function getMedicationDetail(id: string) {
  return MEDICATION_DETAILS.find((m) => m.id === id) ?? null;
}

export function getLabDetail(id: string) {
  return LAB_DETAILS.find((l) => l.id === id) ?? null;
}

export function getVitalDetail(id: string) {
  return VITAL_DETAILS.find((v) => v.id === id) ?? null;
}

export function getEncounterDetail(id: string) {
  return ENCOUNTER_DETAILS.find((e) => e.id === id) ?? null;
}

export function getProcedureDetail(id: string) {
  return PROCEDURE_DETAILS.find((p) => p.id === id) ?? null;
}

export function getAllergyDetail(id: string) {
  return ALLERGY_DETAILS.find((a) => a.id === id) ?? null;
}
