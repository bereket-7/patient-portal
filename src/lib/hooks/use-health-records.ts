'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@trialcliniq/shared-ui';
import { mapClinicalProfileToCache } from '@/lib/clinical-profile-mapper';
import {
  loadAndCacheClinicalRecords,
  type CachedClinicalRecords,
} from '@/lib/healthex-clinical';
import { triggerHealthExFetch } from '@/lib/healthex-connect';
import {
  canHydrateHealthExClinical,
  hasHealthExConsent,
  hasPlatformConsent,
  mergeHealthExSyncIntoAccount,
  resolveConsentReferenceId,
} from '@/lib/healthex-consent';
import { buildDummyCachedClinicalRecords, buildDummyHealthRecords } from '@/lib/mock/dummy-clinical-data';
import { EMPTY_HEALTH_RECORDS, MOCK_HEALTH_RECORDS } from '@/lib/mock/health-records';
import type { HealthRecords } from '@/lib/types/health-records';
import { shouldUseBackendApis, type PatientClinicalProfile } from '@/lib/patient-api';
import { verifyClinicalIntegrityHash } from '@/lib/clinical-integrity';
import {
  loadDevClinicalProfile,
  persistDevClinicalProfile,
  seedDevDummyClinical,
  syncHealthExStatus,
} from '@/lib/patient-dev-accounts';
import { usePatientAccount, updateAccount, saveAccount } from '@/providers/patient-account-provider';

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const useDummyHealthData = process.env.NEXT_PUBLIC_USE_DUMMY_HEALTH_DATA === 'true';
const PENDING_POLL_MS = 2500;
const PENDING_POLL_MAX = 24;

function profileHasData(profile: PatientClinicalProfile): boolean {
  return (
    (profile.diagnoses?.length || 0) > 0 ||
    (profile.medications?.length || 0) > 0 ||
    (profile.observations?.length || 0) > 0 ||
    (profile.encounters?.length || 0) > 0
  );
}

function formatProcessingErrors(profile: PatientClinicalProfile): string {
  const parts = (profile.errors || []).map((e) => `${e.stage}: ${e.reason}`);
  const issues = profile.issues || [];
  if (parts.length) return parts.join('; ');
  if (issues.length) return issues.join('; ');
  return profile.reason || 'Clinical processing failed';
}

async function assertProfilePresentable(
  profile: PatientClinicalProfile,
): Promise<{ ok: true } | { ok: false; error: string; pending?: boolean }> {
  const status = profile.processing_status || 'READY';
  if (status === 'PENDING') {
    return { ok: false, error: 'Processing records…', pending: true };
  }
  if (status === 'FAILED') {
    return { ok: false, error: formatProcessingErrors(profile) };
  }
  if (status === 'READY' || status === 'PARTIAL') {
    const counts = profile.resource_counts || {};
    if (profile.integrity_hash) {
      const valid = await verifyClinicalIntegrityHash(counts, profile.integrity_hash);
      if (!valid) {
        return { ok: false, error: 'Clinical data integrity check failed. Refresh or contact support.' };
      }
    }
    return { ok: true };
  }
  return { ok: false, error: `Unexpected processing status: ${status}` };
}

function cacheHasRows(cache: CachedClinicalRecords | null | undefined): boolean {
  return Boolean(
    cache &&
      ((cache.records.conditions.length || 0) > 0 ||
        (cache.records.encounters.length || 0) > 0 ||
        (cache.records.medications.length || 0) > 0 ||
        (cache.records.observations.length || 0) > 0 ||
        (cache.resourceCounts && Object.keys(cache.resourceCounts).length > 0)),
  );
}

function isPortalSnapshot(value: unknown): value is CachedClinicalRecords {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'records' in value &&
      (value as CachedClinicalRecords).records,
  );
}

/** Coalesce incomplete portal/DB snapshots so dashboard cards never see null/non-array fields. */
function asArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function normalizeHealthRecords(
  records: Partial<HealthRecords> | null | undefined,
): HealthRecords {
  return {
    ...EMPTY_HEALTH_RECORDS,
    vitals: asArray(records?.vitals, EMPTY_HEALTH_RECORDS.vitals),
    conditions: asArray(records?.conditions, EMPTY_HEALTH_RECORDS.conditions),
    allergies: asArray(records?.allergies, EMPTY_HEALTH_RECORDS.allergies),
    lastScan:
      records?.lastScan && typeof records.lastScan === 'object'
        ? {
            title: String((records.lastScan as { title?: unknown }).title ?? '—'),
            facility: String((records.lastScan as { facility?: unknown }).facility ?? '—'),
            address: String((records.lastScan as { address?: unknown }).address ?? '—'),
            date: String((records.lastScan as { date?: unknown }).date ?? '—'),
          }
        : EMPTY_HEALTH_RECORDS.lastScan,
    cholesterol: asArray(records?.cholesterol, EMPTY_HEALTH_RECORDS.cholesterol),
    medications: asArray(records?.medications, EMPTY_HEALTH_RECORDS.medications),
    observations: asArray(records?.observations, EMPTY_HEALTH_RECORDS.observations),
    encounters: asArray(records?.encounters, EMPTY_HEALTH_RECORDS.encounters),
  };
}

export function useHealthRecords() {
  const { account, replaceAccount } = usePatientAccount();
  const { session } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'database' | 'dummy' | 'none'>('none');
  const [processingStatus, setProcessingStatus] = useState<
    'PENDING' | 'READY' | 'PARTIAL' | 'FAILED' | null
  >(null);
  const [processingIssues, setProcessingIssues] = useState<string[]>([]);
  const hydrateAttempted = useRef<string | null>(null);
  const pendingPolls = useRef(0);

  const healthexReady = canHydrateHealthExClinical(account);
  /** Show health UI once platform consent is granted, or as soon as HealthEx is ready to hydrate. */
  const connected = hasPlatformConsent(account) || healthexReady;

  const applyClinicalCache = useCallback(
    (cache: NonNullable<typeof account>['clinicalCache'], patch: Record<string, unknown> = {}) => {
      if (!account || !cache) return;
      const next = updateAccount(account, {
        clinicalCache: cache,
        consentStatus: 'granted',
        consentGrantedAt: account.consentGrantedAt || new Date().toISOString(),
        healthExConnected: true,
        ...patch,
      });
      saveAccount(next);
      replaceAccount(next);
    },
    [account, replaceAccount],
  );

  const loadFromDatabase = useCallback(async () => {
    if (!account?.email || !connected) return null;
    setDbLoading(true);
    setError(null);
    try {
      let profile: PatientClinicalProfile | null = null;
      let portalSnapshot: CachedClinicalRecords | null = null;
      let devAccount = account;

      // Always load via gateway → reporting (avoids consent-gated /api/v1/reports 403).
      if (shouldUseBackendApis()) {
        const loaded = await loadDevClinicalProfile(account.email);
        if (loaded.error) {
          setError(loaded.error);
        }
        if (loaded.account) {
          devAccount = { ...account, ...loaded.account } as typeof account;
        }
        if (loaded.profile && !('error' in loaded.profile)) {
          profile = loaded.profile as PatientClinicalProfile;
          setProcessingStatus(profile.processing_status || 'READY');
          setProcessingIssues(profile.issues || []);

          const gate = await assertProfilePresentable(profile);
          if (!gate.ok) {
            setError(gate.error);
            // Live mode: never fall through to mock on FAILED / PENDING / integrity mismatch.
            return null;
          }

          if (isPortalSnapshot(profile.portal_snapshot)) {
            portalSnapshot = {
              ...profile.portal_snapshot,
              source: 'database',
              processingStatus: profile.processing_status,
              qualityScore: profile.quality_score,
              issues: profile.issues,
              errors: profile.errors,
              integrityHash: profile.integrity_hash,
              resourceCounts: profile.resource_counts || profile.portal_snapshot.resourceCounts,
            };
          }
        }
        if (!portalSnapshot && isPortalSnapshot(loaded.portalSnapshot)) {
          portalSnapshot = { ...loaded.portalSnapshot, source: 'database' };
        }
      }

      if (portalSnapshot && cacheHasRows(portalSnapshot)) {
        const status = portalSnapshot.processingStatus || profile?.processing_status || 'READY';
        if (!demoMode && (status === 'FAILED' || status === 'PENDING')) {
          setProcessingStatus(status);
          setError(
            status === 'PENDING'
              ? 'Processing records…'
              : formatProcessingErrors(
                  profile ||
                    ({
                      errors: portalSnapshot.errors || [],
                      issues: portalSnapshot.issues || [],
                      diagnoses: [],
                      medications: [],
                      procedures: [],
                      observations: [],
                      encounters: [],
                      risk_factors: [],
                      enterprise_id: '',
                      patient_id: '',
                      updated_at: '',
                    } as PatientClinicalProfile),
                ),
          );
          return null;
        }
        applyClinicalCache(portalSnapshot, {
          enterprisePatientId: devAccount.enterprisePatientId || account.enterprisePatientId,
          lastIngestRawUri: portalSnapshot.rawUri || account.lastIngestRawUri,
          lastIngestAt: portalSnapshot.fetchedAt || account.lastIngestAt,
        });
        setDataSource('database');
        setProcessingStatus(status);
        if (status === 'PARTIAL' && (portalSnapshot.issues?.length || 0) > 0) {
          setError(`Some records need review: ${(portalSnapshot.issues || []).slice(0, 3).join('; ')}`);
        }
        return portalSnapshot;
      }

      if (!profile && useDummyHealthData && demoMode) {
        const seeded = await seedDevDummyClinical(account.email);
        if (seeded.error) {
          setError(seeded.error);
        }
        if (seeded.account) {
          devAccount = { ...account, ...seeded.account } as typeof account;
        }
        if (seeded.profile && !('error' in seeded.profile)) {
          profile = seeded.profile as PatientClinicalProfile;
        } else if (useDummyHealthData) {
          const cache = buildDummyCachedClinicalRecords({
            referenceId: account.healthExReferenceId || account.id,
            patientId: account.healthExPatientId,
            enterprisePatientId: devAccount.enterprisePatientId || account.enterprisePatientId,
          });
          applyClinicalCache(cache, {
            enterprisePatientId:
              devAccount.enterprisePatientId || account.enterprisePatientId || `EP-${account.id}`,
          });
          setDataSource('dummy');
          return cache;
        }
      }

      if (profile && profileHasData(profile)) {
        const gate = await assertProfilePresentable(profile);
        if (!gate.ok) {
          setError(gate.error);
          return null;
        }
        const cache = mapClinicalProfileToCache({
          profile,
          referenceId: account.healthExReferenceId || account.id,
          source: useDummyHealthData && profile.encounters?.length ? 'dummy' : 'database',
        });
        applyClinicalCache(cache, {
          enterprisePatientId: devAccount.enterprisePatientId || account.enterprisePatientId,
        });
        setDataSource(cache.source || 'database');
        setProcessingStatus(profile.processing_status || 'READY');
        return cache;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setDbLoading(false);
    }
  }, [account, applyClinicalCache, connected]);

  const persistCacheToDatabase = useCallback(
    async (cache: CachedClinicalRecords, rawUri?: string) => {
      if (!account?.email) {
        return { ok: false as const, error: 'missing_account', enterprisePatientId: null };
      }
      const persisted = await persistDevClinicalProfile(
        account.email,
        {
          available: true,
          resource_counts: cache.resourceCounts || {},
          conditions: cache.records.conditions.map((c) => ({ display: c.name })),
          medications: cache.records.medications.map((m) => ({
            name: m.name,
            status: m.status,
          })),
          observations: cache.records.observations.map((o) => ({
            display: o.name,
            value: o.value,
            date: o.date,
          })),
          encounters: cache.records.encounters.map((e) => ({
            id: e.id,
            type: e.type,
            date: e.date,
            status: e.status,
            facility: e.facility,
            provider: e.provider,
            reason: e.reason,
            class: e.classCode,
          })),
          allergies: (cache.records.allergies || []).map((a) => ({ display: a })),
        },
        {
          portalSnapshot: { ...cache, source: 'database' },
          rawUri: rawUri || cache.rawUri,
          forceFetch: false,
        },
      );
      if (persisted.error) {
        return {
          ok: false as const,
          error: persisted.error,
          enterprisePatientId: persisted.enterprisePatientId,
        };
      }
      return {
        ok: true as const,
        error: null,
        enterprisePatientId:
          persisted.enterprisePatientId || persisted.account?.enterprisePatientId || null,
        portalSnapshot: isPortalSnapshot(persisted.portalSnapshot)
          ? persisted.portalSnapshot
          : cache,
        account: persisted.account,
      };
    },
    [account?.email],
  );

  const hydrateFromHealthEx = useCallback(async () => {
    if (!account?.healthExReferenceId || !hasHealthExConsent(account)) {
      return { ok: false as const, error: 'healthex_not_ready' };
    }
    if (!session.token) {
      return { ok: false as const, error: 'missing_session_token' };
    }

    setDbLoading(true);
    setError(null);
    try {
      const consentReferenceId = resolveConsentReferenceId(account);
      let rawUri: string | undefined;

      if (account.healthExPatientId && consentReferenceId) {
        const ingest = await triggerHealthExFetch({
          healthexPatientId: account.healthExPatientId,
          consentReferenceId,
          authToken: session.token,
          session,
          enterprisePatientId: account.enterprisePatientId,
        });
        rawUri = ingest.raw_uri;
        setProcessingStatus('PENDING');
        setError('Processing records…');
        pendingPolls.current = 0;

        // Live mode: wait for normalize quality gate — do not paint raw HealthEx summary.
        if (!demoMode) {
          const validated = await loadFromDatabase();
          if (validated) {
            setDataSource('database');
            return { ok: true as const, cache: validated };
          }
          return { ok: true as const, error: 'awaiting_validation' };
        }

        const cache = await loadAndCacheClinicalRecords({
          session,
          referenceId: account.healthExReferenceId,
          rawUri: ingest.raw_uri,
          transactionId: ingest.transaction_id,
          ingestClinical: ingest.clinical,
        });
        cache.source = 'live';
        if (!cacheHasRows(cache)) {
          setError('No clinical data returned from HealthEx yet.');
          return { ok: false as const, error: 'empty_clinical' };
        }

        const persisted = await persistCacheToDatabase(cache, rawUri);
        if (!persisted.ok) {
          setError(persisted.error || 'Failed to save clinical data to database');
          applyClinicalCache(cache, {
            healthExPatientId: cache.patientId || account.healthExPatientId,
            lastIngestRawUri: rawUri || cache.rawUri || account.lastIngestRawUri,
            lastIngestAt: cache.fetchedAt,
            consentReferenceId: consentReferenceId || account.consentReferenceId,
          });
          setDataSource('live');
          return { ok: false as const, error: persisted.error || 'persist_failed', cache };
        }

        const stored = persisted.portalSnapshot || cache;
        stored.source = 'database';
        applyClinicalCache(stored, {
          enterprisePatientId: persisted.enterprisePatientId || account.enterprisePatientId,
          healthExPatientId: cache.patientId || account.healthExPatientId,
          lastIngestRawUri: rawUri || cache.rawUri || account.lastIngestRawUri,
          lastIngestAt: cache.fetchedAt,
          consentReferenceId: consentReferenceId || account.consentReferenceId,
        });
        setDataSource('database');
        setProcessingStatus('READY');
        return { ok: true as const, cache: stored };
      }

      // Detail-only path (no patient id / consent ref for ingest).
      const cache = await loadAndCacheClinicalRecords({
        session,
        referenceId: account.healthExReferenceId,
      });
      cache.source = 'live';
      if (!demoMode) {
        setProcessingStatus('PENDING');
        setError('Processing records…');
        return { ok: true as const, error: 'awaiting_validation' };
      }
      if (!cacheHasRows(cache)) {
        setError('No clinical data returned from HealthEx yet.');
        return { ok: false as const, error: 'empty_clinical' };
      }
      applyClinicalCache(cache, {
        lastIngestAt: cache.fetchedAt,
      });
      setDataSource('live');
      return { ok: true as const, cache };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return { ok: false as const, error: message };
    } finally {
      setDbLoading(false);
    }
  }, [account, applyClinicalCache, loadFromDatabase, persistCacheToDatabase, session]);

  useEffect(() => {
    if (!account?.email || !connected) return;

    const cache = account.clinicalCache;
    if (cacheHasRows(cache) && cache?.source === 'database') {
      setDataSource('database');
      return;
    }

    const key = `${account.email}:${account.enterprisePatientId || 'none'}`;
    if (hydrateAttempted.current === key) return;
    hydrateAttempted.current = key;

    void (async () => {
      // DB-first: always try Postgres before HealthEx.
      const fromDb = await loadFromDatabase();
      if (fromDb && cacheHasRows(fromDb)) return;

      // First fill only — HealthEx when nothing stored yet.
      if (healthexReady && session.token) {
        await hydrateFromHealthEx();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per account/enterprise id
  }, [account?.email, account?.enterprisePatientId, connected, healthexReady, session.token]);

  // Poll while normalize quality gate is still PENDING.
  useEffect(() => {
    if (demoMode || processingStatus !== 'PENDING' || !account?.email) return;
    if (pendingPolls.current >= PENDING_POLL_MAX) return;
    const timer = setTimeout(() => {
      pendingPolls.current += 1;
      void loadFromDatabase();
    }, PENDING_POLL_MS);
    return () => clearTimeout(timer);
  }, [processingStatus, account?.email, loadFromDatabase]);

  const records: HealthRecords = useMemo(() => {
    if (demoMode && !account?.clinicalCache) return MOCK_HEALTH_RECORDS;
    if (
      !demoMode &&
      (processingStatus === 'FAILED' || processingStatus === 'PENDING')
    ) {
      return EMPTY_HEALTH_RECORDS;
    }
    if (account?.clinicalCache?.records) {
      return normalizeHealthRecords(account.clinicalCache.records);
    }
    // Live mode: never paint dummy/mock clinical data.
    if (!demoMode) return EMPTY_HEALTH_RECORDS;
    if (useDummyHealthData && connected) return buildDummyHealthRecords();
    return EMPTY_HEALTH_RECORDS;
  }, [account?.clinicalCache, connected, processingStatus]);

  const encounters = records.encounters || [];

  const hasLiveData = Boolean(
    cacheHasRows(account?.clinicalCache) &&
      processingStatus !== 'FAILED' &&
      processingStatus !== 'PENDING',
  );

  const refreshMedicalData = useCallback(async () => {
    if (!account?.healthExReferenceId || !account.healthExPatientId) {
      if (useDummyHealthData && connected) {
        await loadFromDatabase();
        return { ok: true as const };
      }
      setError('Connect and sync HealthEx first (need patient ID).');
      return { ok: false as const, error: 'missing_healthex_ids' };
    }
    if (!hasHealthExConsent(account)) {
      setError('HealthEx consent is not granted yet.');
      return { ok: false as const, error: 'not_consented' };
    }

    setRefreshing(true);
    setError(null);
    try {
      const sync = await syncHealthExStatus(account.email);
      if (!sync.account) {
        setError('Could not verify HealthEx consent status.');
        setRefreshing(false);
        return { ok: false as const, error: 'sync_failed' };
      }
      const liveConsent = sync.healthex?.consent_status ?? sync.account.healthexConsentStatus;
      if (liveConsent !== 'CONSENTED') {
        const invalidated = mergeHealthExSyncIntoAccount(account, {
          consentStatus: liveConsent,
          consentReferenceId: sync.healthex?.consent_reference_id ?? sync.account.consentReferenceId,
        });
        saveAccount(invalidated);
        replaceAccount(invalidated);
        setError('HealthEx consent is not approved. Complete the email consent step first.');
        setRefreshing(false);
        return { ok: false as const, error: 'not_consented' };
      }

      const consentReferenceId = resolveConsentReferenceId({
        ...account,
        consentReferenceId: sync.healthex?.consent_reference_id ?? account.consentReferenceId,
        healthexConsentStatus: liveConsent,
      });
      if (!consentReferenceId) {
        setError('Missing consent reference. Sync from HealthEx first.');
        setRefreshing(false);
        return { ok: false as const, error: 'missing_consent_reference' };
      }

      // On-demand HealthEx fetch → normalize quality gate → validated profile.
      const ingest = await triggerHealthExFetch({
        healthexPatientId: sync.account.healthExPatientId || account.healthExPatientId,
        consentReferenceId,
        authToken: session.token,
        session,
        enterprisePatientId:
          sync.account.enterprisePatientId || account.enterprisePatientId,
      });

      setProcessingStatus('PENDING');
      setError('Processing records…');
      pendingPolls.current = 0;

      // Persist interim live summary only in demo; live mode waits for READY/PARTIAL.
      if (demoMode) {
        const cache = await loadAndCacheClinicalRecords({
          session,
          referenceId: account.healthExReferenceId,
          rawUri: ingest.raw_uri,
          transactionId: ingest.transaction_id,
          ingestClinical: ingest.clinical,
        });
        cache.source = 'live';
        const persisted = await persistCacheToDatabase(cache, ingest.raw_uri);
        if (persisted.ok) {
          const stored = persisted.portalSnapshot || cache;
          stored.source = 'database';
          applyClinicalCache(stored, {
            enterprisePatientId:
              persisted.enterprisePatientId ||
              sync.account.enterprisePatientId ||
              account.enterprisePatientId,
            lastIngestRawUri: ingest.raw_uri,
            lastIngestAt: new Date().toISOString(),
            consentReferenceId,
          });
          setDataSource('database');
        }
      }

      const validated = await loadFromDatabase();
      setRefreshing(false);
      if (!validated) {
        // PENDING polls continue via effect; treat ingest accept as success.
        return { ok: true as const, error: 'awaiting_validation', ingest };
      }
      return { ok: true as const, cache: validated, ingest };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setRefreshing(false);
      return { ok: false as const, error: message };
    }
  }, [
    account,
    applyClinicalCache,
    connected,
    loadFromDatabase,
    persistCacheToDatabase,
    replaceAccount,
    session,
  ]);

  return {
    records,
    encounters,
    connected,
    hasLiveData,
    refreshing: refreshing || dbLoading || processingStatus === 'PENDING',
    error,
    dataSource,
    useDummyHealthData,
    processingStatus,
    processingIssues,
    lastFetchedAt: account?.clinicalCache?.fetchedAt || account?.lastIngestAt || null,
    rawUri: account?.lastIngestRawUri || account?.clinicalCache?.rawUri || null,
    resourceCounts: account?.clinicalCache?.resourceCounts || null,
    refreshMedicalData,
    loadFromDatabase,
  };
}
