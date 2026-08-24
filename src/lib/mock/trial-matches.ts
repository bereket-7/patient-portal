export type TrialMatchStatus = 'Matched' | 'Under Review' | 'Enrolled' | 'Interested';

export type EnrollmentStage =
  | 'matched'
  | 'interested'
  | 'under_review'
  | 'screening'
  | 'enrolled';

export const ENROLLMENT_STAGE_LABELS: Record<EnrollmentStage, string> = {
  matched: 'Matched',
  interested: 'Expressed Interest',
  under_review: 'Coordinator Review',
  screening: 'Screening',
  enrolled: 'Enrolled',
};

export const ENROLLMENT_STAGE_ORDER: EnrollmentStage[] = [
  'matched',
  'interested',
  'under_review',
  'screening',
  'enrolled',
];

export type TrialMatch = {
  id: string;
  trialName: string;
  sponsor: string;
  phase: string;
  eligibilityScore: number;
  status: TrialMatchStatus;
  description: string;
  location: string;
  currentStage: EnrollmentStage;
  siteName: string;
  coordinatorName: string;
  coordinatorEmail: string;
  nextStep: string;
  lastUpdated: string;
  coordinatorNote?: string;
  /** Extended detail for trial detail page */
  studyDesign?: string;
  estimatedDuration?: string;
  inclusionCriteria?: string[];
  exclusionCriteria?: string[];
  visitSchedule?: string[];
  primaryEndpoint?: string;
  therapeuticArea?: string;
};

export const MOCK_TRIAL_MATCHES: TrialMatch[] = [
  {
    id: 'MATCH-001',
    trialName: 'Phase III Parkinson Disease Study',
    sponsor: 'NeuroPharm Research',
    phase: 'Phase III',
    eligibilityScore: 92,
    status: 'Matched',
    description:
      'Evaluating a novel therapy for early-stage Parkinson disease with motor symptom management.',
    location: 'Boston, MA · 12 miles away',
    currentStage: 'matched',
    siteName: 'Boston Clinical Research Center',
    coordinatorName: 'Dr. Sarah Chen',
    coordinatorEmail: 'schen@bcrc.example.org',
    nextStep: 'Express your interest to notify the research team.',
    lastUpdated: '2026-07-12T10:00:00Z',
    therapeuticArea: 'Neurology',
    studyDesign: 'Randomized, double-blind, placebo-controlled',
    estimatedDuration: '18 months active treatment + 6 months follow-up',
    primaryEndpoint: 'Change in UPDRS Part III motor score at 24 weeks',
    inclusionCriteria: [
      'Age 40–75 with early-stage Parkinson disease diagnosis',
      'Stable dopaminergic therapy for ≥ 4 weeks',
      'Able to attend monthly site visits',
    ],
    exclusionCriteria: [
      'Deep brain stimulation within 12 months',
      'Uncontrolled psychiatric illness',
      'Participation in another interventional trial',
    ],
    visitSchedule: [
      'Screening (week −2)',
      'Baseline randomization (week 0)',
      'Monthly motor assessments (weeks 4–24)',
      'Safety follow-up (week 28)',
    ],
  },
  {
    id: 'MATCH-002',
    trialName: 'Diabetes Management Clinical Trial',
    sponsor: 'Metabolic Health Institute',
    phase: 'Phase II',
    eligibilityScore: 88,
    status: 'Under Review',
    description:
      'Study of combined lifestyle and medication intervention for Type 2 diabetes management.',
    location: 'Cambridge, MA · 8 miles away',
    currentStage: 'under_review',
    siteName: 'Cambridge Metabolic Research Site',
    coordinatorName: 'James Rivera',
    coordinatorEmail: 'jrivera@cmrs.example.org',
    nextStep: 'A coordinator is reviewing your match. You will be contacted if additional information is needed.',
    lastUpdated: '2026-07-11T15:30:00Z',
    coordinatorNote:
      'Reviewing recent HbA1c observations and medication history before scheduling screening.',
    therapeuticArea: 'Endocrinology',
    studyDesign: 'Open-label lifestyle + medication optimization cohort',
    estimatedDuration: '12 months',
    primaryEndpoint: 'HbA1c change at 6 months vs baseline',
    inclusionCriteria: [
      'Type 2 diabetes on stable oral therapy',
      'HbA1c 7.0–10.0% within last 90 days',
      'BMI 25–40',
    ],
    exclusionCriteria: ['Insulin initiation within 3 months', 'Pregnancy or nursing'],
    visitSchedule: ['Screening labs', 'Month 1, 3, 6, 12 clinic visits'],
  },
  {
    id: 'MATCH-003',
    trialName: 'Cardiovascular Health Prevention Study',
    sponsor: 'HeartCare Trials',
    phase: 'Phase IV',
    eligibilityScore: 79,
    status: 'Matched',
    description:
      'Long-term observational study tracking cardiovascular outcomes in adults with hypertension.',
    location: 'Brookline, MA · 5 miles away',
    currentStage: 'screening',
    siteName: 'Brookline Heart Institute',
    coordinatorName: 'Maria Lopez',
    coordinatorEmail: 'mlopez@bhi.example.org',
    nextStep: 'Screening visit scheduled — check your email for appointment details.',
    lastUpdated: '2026-07-13T08:00:00Z',
    coordinatorNote: 'Screening labs ordered. Please fast 8 hours before your visit.',
    therapeuticArea: 'Cardiology',
    studyDesign: 'Prospective observational registry',
    estimatedDuration: '3 years follow-up',
    primaryEndpoint: 'Major adverse cardiovascular events (MACE)',
    inclusionCriteria: [
      'Hypertension on ≥ 1 antihypertensive',
      'Age ≥ 45',
      'Willing to share longitudinal vitals from HealthEx',
    ],
    exclusionCriteria: ['Recent MI or stroke within 6 months'],
    visitSchedule: ['Quarterly vitals & labs', 'Annual echocardiogram if indicated'],
  },
  {
    id: 'MATCH-004',
    trialName: 'Oncology Immunotherapy Extension Study',
    sponsor: 'OncoAdvance Research',
    phase: 'Phase III',
    eligibilityScore: 95,
    status: 'Enrolled',
    description:
      'Long-term follow-up study for patients who completed prior immunotherapy trials.',
    location: 'Boston, MA · 10 miles away',
    currentStage: 'enrolled',
    siteName: 'Dana Research Oncology Center',
    coordinatorName: 'Dr. Priya Nair',
    coordinatorEmail: 'pnair@droc.example.org',
    nextStep: 'Continue scheduled follow-up visits per your enrollment protocol.',
    lastUpdated: '2026-07-08T14:00:00Z',
    coordinatorNote: 'Enrollment confirmed. Next follow-up visit in 4 weeks.',
    therapeuticArea: 'Oncology',
    studyDesign: 'Long-term safety extension (LTE)',
    estimatedDuration: '5 years',
    primaryEndpoint: 'Immune-related adverse event incidence',
    inclusionCriteria: ['Prior completion of parent immunotherapy protocol'],
    exclusionCriteria: ['Active uncontrolled autoimmune flare'],
    visitSchedule: ['Follow-up every 8 weeks for 2 years, then quarterly'],
  },
];

export function getTrialMatches(): TrialMatch[] {
  return MOCK_TRIAL_MATCHES;
}

export function getTrialMatch(id: string): TrialMatch | undefined {
  return MOCK_TRIAL_MATCHES.find((m) => m.id === id);
}

export function getStageProgress(stage: EnrollmentStage): number {
  const index = ENROLLMENT_STAGE_ORDER.indexOf(stage);
  if (index < 0) return 0;
  return Math.round(((index + 1) / ENROLLMENT_STAGE_ORDER.length) * 100);
}

export function getParticipationSummary(): { underReview: number; screening: number; enrolled: number } {
  const matches = getTrialMatches();
  return {
    underReview: matches.filter((m) => m.currentStage === 'under_review').length,
    screening: matches.filter((m) => m.currentStage === 'screening').length,
    enrolled: matches.filter((m) => m.status === 'Enrolled').length,
  };
}
