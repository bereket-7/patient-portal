'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@trialcliniq/shared-ui';
import {
  evaluateTrialEligibility,
  fetchPatientClinicalProfile,
  shouldUseBackendApis,
} from '@/lib/patient-api';
import {
  getTrialMatch,
  getTrialMatches,
  MOCK_TRIAL_MATCHES,
  type TrialMatch,
} from '@/lib/mock/trial-matches';
import { hasPlatformConsent } from '@/lib/healthex-consent';
import { usePatientAccount } from '@/providers/patient-account-provider';

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

function mapEligibilityToTrialMatch(
  match: {
    trial_id: string;
    score: number;
    match_id?: string;
    status?: string;
  },
  index: number,
): TrialMatch {
  const trialId = match.trial_id;
  const mockTemplate = MOCK_TRIAL_MATCHES[index % MOCK_TRIAL_MATCHES.length];
  return {
    id: match.match_id || `LIVE-${trialId}`,
    trialName: trialId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    sponsor: 'TrialClinIQ Registry',
    phase: mockTemplate?.phase || 'Phase II/III',
    eligibilityScore: Math.round(match.score * 100) || 85,
    status: 'Matched',
    description:
      mockTemplate?.description ||
      `Eligible for trial ${trialId} based on your normalized clinical profile.`,
    location: mockTemplate?.location || 'See coordinator for site details',
    currentStage: 'matched',
    siteName: mockTemplate?.siteName || 'Research site',
    coordinatorName: mockTemplate?.coordinatorName || 'Trial coordinator',
    coordinatorEmail: mockTemplate?.coordinatorEmail || 'coordinator@trialcliniq.example.org',
    nextStep: 'Express your interest to notify the research team.',
    lastUpdated: new Date().toISOString(),
    therapeuticArea: mockTemplate?.therapeuticArea,
    studyDesign: mockTemplate?.studyDesign,
    estimatedDuration: mockTemplate?.estimatedDuration,
    primaryEndpoint: mockTemplate?.primaryEndpoint,
    inclusionCriteria: mockTemplate?.inclusionCriteria,
    exclusionCriteria: mockTemplate?.exclusionCriteria,
    visitSchedule: mockTemplate?.visitSchedule,
  };
}

export function useTrialMatches() {
  const { account } = usePatientAccount();
  const { session } = useAuth();
  const [liveMatches, setLiveMatches] = useState<TrialMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'mock' | 'live'>('mock');

  const canUseLive =
    shouldUseBackendApis() &&
    !demoMode &&
    hasPlatformConsent(account) &&
    Boolean(account?.enterprisePatientId && session.token);

  const refreshLiveMatches = useCallback(async () => {
    if (!canUseLive || !account?.enterprisePatientId) return;
    setLoading(true);
    setError(null);
    try {
      const profile = await fetchPatientClinicalProfile(session, account.enterprisePatientId);
      if (!profile) {
        setLiveMatches([]);
        setSource('mock');
        setLoading(false);
        return;
      }
      const result = await evaluateTrialEligibility(session, {
        patientId: profile.patient_id || account.healthExPatientId || account.id,
        enterpriseId: account.enterprisePatientId,
        profile: {
          age: profile.age,
          diagnoses: profile.diagnoses,
          medications: profile.medications,
          procedures: profile.procedures,
        },
      });
      const mapped = (result.matches || []).map((m, i) => mapEligibilityToTrialMatch(m, i));
      setLiveMatches(mapped);
      setSource(mapped.length > 0 ? 'live' : 'mock');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSource('mock');
    } finally {
      setLoading(false);
    }
  }, [account, canUseLive, session]);

  useEffect(() => {
    if (canUseLive) {
      void refreshLiveMatches();
    }
  }, [canUseLive, refreshLiveMatches]);

  const matches: TrialMatch[] = useMemo(() => {
    if (liveMatches && liveMatches.length > 0) return liveMatches;
    return getTrialMatches();
  }, [liveMatches]);

  return {
    matches,
    loading,
    error,
    source: liveMatches && liveMatches.length > 0 ? 'live' : source,
    isLive: source === 'live' && (liveMatches?.length || 0) > 0,
    refreshLiveMatches,
    getMatch: (id: string) => matches.find((m) => m.id === id) || getTrialMatch(id),
  };
}
