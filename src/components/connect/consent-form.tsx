'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@trialcliniq/shared-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePatientAccount, updateAccount, saveAccount } from '@/providers/patient-account-provider';
import { triggerHealthExFetch } from '@/lib/healthex-connect';
import { loadAndCacheClinicalRecords } from '@/lib/healthex-clinical';
import {
  canAuthorizePlatformConsent,
  hasHealthExConsent,
  mergeHealthExSyncIntoAccount,
  resolveConsentReferenceId,
} from '@/lib/healthex-consent';
import {
  captureHealthExConsent,
  linkPatientIdentity,
} from '@/lib/patient-api';
import { syncHealthExStatus } from '@/lib/patient-dev-accounts';

export function ConsentForm() {
  const { account, grantConsent, denyConsent, replaceAccount } = usePatientAccount();
  const { session, updateSession } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  async function handleAllow() {
    if (!account) return;
    setLoading(true);
    setError(null);
    setProgress(null);

    if (!hasHealthExConsent(account)) {
      setError(
        'HealthEx consent is not CONSENTED. Check your email for the HealthEx consent request, approve it, then Sync from Connect.',
      );
      setLoading(false);
      return;
    }

    setProgress('Verifying HealthEx consent…');
    const sync = await syncHealthExStatus(account.email);
    const liveConsent = sync.healthex?.consent_status ?? sync.account?.healthexConsentStatus;
    if (!sync.account || liveConsent !== 'CONSENTED') {
      if (sync.account) {
        const invalidated = mergeHealthExSyncIntoAccount(account, {
          consentStatus: liveConsent,
          consentReferenceId: sync.healthex?.consent_reference_id ?? sync.account.consentReferenceId,
        });
        replaceAccount(invalidated);
      }
      setError(
        'HealthEx consent is not approved yet. Complete the email consent step, sync on Connect, then try again.',
      );
      setLoading(false);
      return;
    }

    const healthexPatientId = sync.account.healthExPatientId || account.healthExPatientId;
    if (!healthexPatientId) {
      setError(
        'Missing HealthEx patient ID. Go back to Connect and Sync from HealthEx (requires CONSENTED).',
      );
      setLoading(false);
      return;
    }

    const referenceId = account.healthExReferenceId;
    if (!referenceId) {
      setError('Missing HealthEx reference ID. Retry HealthEx link from Connect.');
      setLoading(false);
      return;
    }

    const consentReferenceId =
      sync.healthex?.consent_reference_id ||
      sync.account.consentReferenceId ||
      resolveConsentReferenceId(account);
    if (!consentReferenceId) {
      setError('Missing consent reference. Sync from HealthEx first.');
      setLoading(false);
      return;
    }

    try {
      let enterprisePatientId = account.enterprisePatientId;
      let backendConsentId = account.backendConsentId;

      if (session.token) {
        // Capture platform consent under the HealthEx patient id — ingest validates against this id.
        setProgress('Capturing research consent…');
        try {
          const captured = await captureHealthExConsent(session, {
            patientId: healthexPatientId,
            consentReferenceId,
          });
          backendConsentId =
            captured.consent_id || captured.consent?.consent_id || backendConsentId;
        } catch (err) {
          // already_captured / transient errors should not block FHIR hydration
          console.warn('consent_capture_failed', err);
        }

        setProgress('Linking patient identity…');
        try {
          const identity = await linkPatientIdentity(session, {
            healthexPatientId,
            externalPatientId: account.id,
          });
          enterprisePatientId = identity.enterprise_patient_id;
        } catch (err) {
          console.warn('mpi_link_failed', err);
        }
      }

      setProgress('Fetching medical records from HealthEx…');
      const ingest = await triggerHealthExFetch({
        healthexPatientId,
        consentReferenceId,
        authToken: session.token,
        session,
        enterprisePatientId,
      });

      setProgress('Loading clinical summary…');
      let clinicalCache;
      try {
        clinicalCache = await loadAndCacheClinicalRecords({
          session,
          referenceId,
          rawUri: ingest.raw_uri,
          transactionId: ingest.transaction_id,
          ingestClinical: ingest.clinical,
        });
      } catch (err) {
        console.warn('clinical summary load failed', err);
      }

      // Persist into Postgres so later logins load from the database.
      if (clinicalCache) {
        try {
          const { persistDevClinicalProfile } = await import('@/lib/patient-dev-accounts');
          const persisted = await persistDevClinicalProfile(
            account.email,
            undefined,
            {
              portalSnapshot: { ...clinicalCache, source: 'database' },
              rawUri: ingest.raw_uri,
              forceFetch: false,
            },
          );
          if (persisted.error) {
            console.warn('clinical_persist_failed', persisted.error);
          }
          if (persisted.enterprisePatientId) {
            enterprisePatientId = persisted.enterprisePatientId;
          }
          if (persisted.portalSnapshot && 'records' in persisted.portalSnapshot) {
            clinicalCache = {
              ...(persisted.portalSnapshot as typeof clinicalCache),
              source: 'database',
            };
          }
        } catch (err) {
          console.warn('clinical_persist_failed', err);
        }
      }

      const withConsent = updateAccount(account, {
        consentReferenceId,
        healthExPatientId: clinicalCache?.patientId || healthexPatientId,
        enterprisePatientId,
        backendConsentId,
        healthExConnected: true,
        consentStatus: 'granted',
        consentGrantedAt: new Date().toISOString(),
        lastIngestRawUri: ingest.raw_uri,
        lastIngestAt: new Date().toISOString(),
        clinicalCache,
        healthexConsentStatus: clinicalCache?.consentStatus || account.healthexConsentStatus,
        healthexRetrievalStatus:
          clinicalCache?.retrievalStatus || account.healthexRetrievalStatus,
      });
      saveAccount(withConsent);
      replaceAccount(withConsent);

      if (enterprisePatientId && enterprisePatientId !== session.patientId) {
        updateSession({ patientId: enterprisePatientId });
      } else if (healthexPatientId !== session.patientId) {
        updateSession({ patientId: healthexPatientId });
      }

      grantConsent();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'fetch_failed');
      setProgress(null);
      setLoading(false);
    }
  }

  function handleDeny() {
    denyConsent();
    router.push('/dashboard');
  }

  const canAllow = canAuthorizePlatformConsent(account);

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Authorization Request</CardTitle>
          <CardDescription>HealthEx is requesting your consent on behalf of TrialClinIQ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTitle className="text-base">Do you authorize TrialClinIQ to access your health records?</AlertTitle>
            <AlertDescription className="mt-2">
              After you Allow, TrialClinIQ captures platform consent, then fetches your FHIR medical
              record from HealthEx into the raw zone and your health summary.
            </AlertDescription>
          </Alert>

          {!canAllow && (
            <Alert variant="destructive">
              <AlertDescription>
                HealthEx email consent must be approved first. Open the HealthEx message in your inbox,
                grant consent, sync on Connect until status is CONSENTED, then return here.
              </AlertDescription>
            </Alert>
          )}

          {progress && (
            <Alert>
              <AlertDescription className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {progress}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              HealthEx consent verified (CONSENTED)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Platform consent capture + MPI link
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Clinical fetch via HealthEx FHIR $everything
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              You can revoke consent at any time
            </li>
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleAllow}
              disabled={loading || !canAllow}
              className="flex-1 gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {loading ? 'Fetching medical data…' : 'Allow & fetch records'}
            </Button>
            <Button onClick={handleDeny} variant="outline" disabled={loading} className="flex-1 gap-2">
              <XCircle className="h-4 w-4" />
              Deny
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
