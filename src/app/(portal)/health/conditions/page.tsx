'use client';

import { HeartPulse, Loader2, RefreshCw } from 'lucide-react';
import { ConditionsTable } from '@/components/dashboard/conditions-table';
import { BackendClinicalPayload } from '@/components/health/backend-clinical-payload';
import { MedicationSpotlight } from '@/components/health/medication-spotlight';
import { PageCtaBanner } from '@/components/layout/page-cta-banner';
import { SoftCtaSection } from '@/components/layout/soft-cta-section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useHealthRecords } from '@/lib/hooks/use-health-records';
import {
  MOCK_BACKEND_CLINICAL_CONDITIONS,
  resolveConditions,
} from '@/lib/mock/backend-clinical';

export default function ConditionsPage() {
  const {
    records,
    connected,
    refreshing,
    error,
    dataSource,
    useDummyHealthData,
    refreshMedicalData,
    loadFromDatabase,
  } = useHealthRecords();
  const { conditions, usingSample } = resolveConditions(records.conditions);

  return (
    <div className="space-y-8">
      <PageCtaBanner
        tone="primary"
        eyebrow="Conditions"
        title="Understand the diagnoses that guide matching"
        description="Active and historical conditions from your connected HealthEx record help TrialClinIQ identify trials that fit your clinical profile."
        ctaLabel="See medications"
        ctaHref="/health/medications"
        secondaryLabel="Browse trials"
        secondaryHref="/trials"
        imageSrc="/images/doctor.jpg"
        imageAlt="Clinical consultation and care planning"
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Conditions</h1>
          <p className="text-sm text-muted-foreground">
            {usingSample &&
              'Sample conditions mapped from the HealthEx clinical.conditions contract — live ingest will replace these.'}
            {!usingSample && dataSource === 'database' && 'Loaded from clinical profile database.'}
            {!usingSample &&
              dataSource === 'dummy' &&
              useDummyHealthData &&
              'Showing dev dummy conditions (Postgres-backed).'}
            {!usingSample && dataSource === 'live' && 'Synced from HealthEx FHIR bundle.'}
            {!usingSample && dataSource === 'none' && connected && 'No conditions loaded yet.'}
            {!usingSample && !connected && 'Authorize platform consent to view your diagnoses.'}
          </p>
        </div>
        {connected && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={refreshing}
            onClick={() => void (useDummyHealthData ? loadFromDatabase() : refreshMedicalData())}
          >
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        )}
      </div>

      {usingSample && (
        <Alert>
          <AlertTitle>Sample HealthEx payload</AlertTitle>
          <AlertDescription>
            These rows are produced by <code className="text-xs">mapClinicalToHealthRecords()</code> from
            the same <code className="text-xs">clinical.conditions</code> fields ingestion returns (
            <code className="text-xs">code</code>, <code className="text-xs">display</code>,{' '}
            <code className="text-xs">onset</code>). Reporting stores the display names as{' '}
            <code className="text-xs">diagnoses[]</code>.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ConditionsTable conditions={conditions} />

      <MedicationSpotlight medications={records.medications} compact />

      {usingSample && (
        <BackendClinicalPayload
          payload={MOCK_BACKEND_CLINICAL_CONDITIONS}
          title="Backend clinical.conditions JSON"
          description="Same HealthEx ingest fields the portal maps into the conditions table."
        />
      )}

      <SoftCtaSection
        icon={HeartPulse}
        title="Conditions + medications work together"
        description="Matching is stronger when both your diagnoses and treatment plan are current. Refresh from HealthEx after care visits."
        points={[
          'Severity and timing inform eligibility rules',
          'Related prescriptions appear in your medication list',
          'You can revoke research access anytime',
        ]}
        ctaLabel="Refresh HealthEx connection"
        ctaHref="/connect/healthex"
      />
    </div>
  );
}
