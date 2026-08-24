'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { EncountersList, EncountersSummary } from '@/components/health/encounters-list';
import { PageCtaBanner } from '@/components/layout/page-cta-banner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useHealthRecords } from '@/lib/hooks/use-health-records';

export default function VisitsPage() {
  const {
    encounters,
    connected,
    refreshing,
    error,
    dataSource,
    useDummyHealthData,
    refreshMedicalData,
    loadFromDatabase,
  } = useHealthRecords();

  const lastVisit = encounters[0]?.date;

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
            {dataSource === 'database' && 'Loaded from clinical profile database.'}
            {dataSource === 'dummy' && useDummyHealthData && 'Showing dev dummy encounters (Postgres-backed).'}
            {dataSource === 'live' && 'Synced from HealthEx FHIR bundle.'}
            {dataSource === 'none' && connected && 'No encounters loaded yet.'}
            {!connected && 'Authorize platform consent to view your visit history.'}
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {encounters.length > 0 && (
        <EncountersSummary count={encounters.length} lastVisit={lastVisit} />
      )}

      <EncountersList encounters={encounters} />
    </div>
  );
}
