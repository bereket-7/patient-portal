'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { BackendClinicalPayload } from '@/components/health/backend-clinical-payload';
import { EncountersList, EncountersSummary } from '@/components/health/encounters-list';
import { PageCtaBanner } from '@/components/layout/page-cta-banner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useHealthRecords } from '@/lib/hooks/use-health-records';
import { MOCK_BACKEND_CLINICAL_ENCOUNTERS, resolveVisits } from '@/lib/mock/backend-encounters';

export default function VisitsPage() {
  const {
    encounters: liveEncounters,
    connected,
    refreshing,
    error,
    dataSource,
    useDummyHealthData,
    refreshMedicalData,
    loadFromDatabase,
  } = useHealthRecords();
  const { encounters, usingSample } = resolveVisits(liveEncounters);
  const lastVisit = [...encounters].sort((a, b) => {
    const da = a.date && a.date !== '—' ? new Date(a.date).getTime() : 0;
    const db = b.date && b.date !== '—' ? new Date(b.date).getTime() : 0;
    return db - da;
  })[0]?.date;

  return (
    <div className="space-y-8">
      <PageCtaBanner
        tone="primary"
        eyebrow="Care timeline"
        title="Your visits & encounters from HealthEx"
        description="FHIR Encounter resources from your authorized medical record — ambulatory visits, labs, imaging, and emergency care."
        ctaLabel="Back to dashboard"
        ctaHref="/dashboard"
        secondaryLabel="Conditions"
        secondaryHref="/health/conditions"
        imageSrc="/images/doctor.jpg"
        imageAlt="Patient reviewing visit history with clinician"
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visits & encounters</h1>
          <p className="text-sm text-muted-foreground">
            {usingSample &&
              'Sample visits mapped from the HealthEx clinical.encounters contract — live ingest will replace these.'}
            {!usingSample && dataSource === 'database' && 'Loaded from clinical profile database.'}
            {!usingSample &&
              dataSource === 'dummy' &&
              useDummyHealthData &&
              'Showing dev dummy encounters (Postgres-backed).'}
            {!usingSample && dataSource === 'live' && 'Synced from HealthEx FHIR bundle.'}
            {!usingSample && dataSource === 'none' && connected && 'No encounters loaded yet.'}
            {!usingSample && !connected && 'Authorize platform consent to view your visit history.'}
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
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        )}
      </div>

      {usingSample && (
        <Alert>
          <AlertTitle>Sample HealthEx payload</AlertTitle>
          <AlertDescription>
            These cards are produced by <code className="text-xs">mapClinicalToHealthRecords()</code> from
            the same <code className="text-xs">clinical.encounters</code> fields ingestion and reporting
            return (<code className="text-xs">id</code>, <code className="text-xs">type</code>,{' '}
            <code className="text-xs">date</code>, <code className="text-xs">status</code>,{' '}
            <code className="text-xs">facility</code>, <code className="text-xs">provider</code>,{' '}
            <code className="text-xs">reason</code>, <code className="text-xs">class</code>).
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {encounters.length > 0 && (
        <EncountersSummary count={encounters.length} lastVisit={lastVisit} />
      )}

      <EncountersList encounters={encounters} />

      {usingSample && (
        <BackendClinicalPayload
          payload={MOCK_BACKEND_CLINICAL_ENCOUNTERS}
          title="Backend clinical.encounters JSON"
          description="Same HealthEx ingest / reporting profile fields the portal maps into visit cards."
        />
      )}
    </div>
  );
}
