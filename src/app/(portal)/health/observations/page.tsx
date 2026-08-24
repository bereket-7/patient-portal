'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Activity, Loader2, RefreshCw } from 'lucide-react';
import { BackendClinicalPayload } from '@/components/health/backend-clinical-payload';
import { PageCtaBanner } from '@/components/layout/page-cta-banner';
import { SoftCtaSection } from '@/components/layout/soft-cta-section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { useHealthRecords } from '@/lib/hooks/use-health-records';
import {
  MOCK_BACKEND_CLINICAL_OBSERVATIONS,
  resolveObservations,
} from '@/lib/mock/backend-clinical';
import type { ObservationRecord } from '@/lib/types/health-records';

const columns: ColumnDef<ObservationRecord>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'value',
    header: ({ column }) => <SortableHeader column={column} title="Value" />,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => <SortableHeader column={column} title="Date" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('date')}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
  },
];

export default function ObservationsPage() {
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
  const { observations, usingSample } = resolveObservations(records.observations);

  return (
    <div className="space-y-8">
      <PageCtaBanner
        tone="primary"
        eyebrow="Lab insights"
        title="See the signals behind your trial matches"
        description="Observations from HealthEx — labs, vitals trends, and clinical findings — help eligibility rules understand your unique health picture."
        ctaLabel="Review medications"
        ctaHref="/health/medications"
        secondaryLabel="View conditions"
        secondaryHref="/health/conditions"
        imageSrc="/images/research.jpg"
        imageAlt="Clinical research and laboratory insights"
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Observations</h1>
          <p className="text-sm text-muted-foreground">
            {usingSample &&
              'Sample observations mapped from the HealthEx clinical.observations contract — live ingest will replace these.'}
            {!usingSample && dataSource === 'database' && 'Loaded from clinical profile database.'}
            {!usingSample &&
              dataSource === 'dummy' &&
              useDummyHealthData &&
              'Showing dev dummy observations (Postgres-backed).'}
            {!usingSample && dataSource === 'live' && 'Synced from HealthEx FHIR bundle.'}
            {!usingSample && dataSource === 'none' && connected && 'No observations loaded yet.'}
            {!usingSample && !connected && 'Authorize platform consent to view your labs and vitals.'}
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
            These rows are produced by <code className="text-xs">mapClinicalToHealthRecords()</code> from
            the same <code className="text-xs">clinical.observations</code> fields ingestion returns (
            <code className="text-xs">display</code>, <code className="text-xs">value</code>,{' '}
            <code className="text-xs">date</code>, <code className="text-xs">status</code>).
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent observations</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable
            columns={columns}
            data={observations}
            searchPlaceholder="Search observations…"
            emptyMessage="No observations on file."
            filters={[
              {
                columnId: 'status',
                label: 'Status',
                options: [
                  { label: 'Final', value: 'Final' },
                  { label: 'Preliminary', value: 'Preliminary' },
                ],
              },
            ]}
          />
        </CardContent>
      </Card>

      {usingSample && (
        <BackendClinicalPayload
          payload={MOCK_BACKEND_CLINICAL_OBSERVATIONS}
          title="Backend clinical.observations JSON"
          description="Same HealthEx ingest fields the portal maps into the observations table."
        />
      )}

      <SoftCtaSection
        icon={Activity}
        title="How observations support matching"
        description="Lab trends and vitals from HealthEx feed eligibility checks so coordinators see a current clinical picture."
        points={[
          'Recent labs inform inclusion and exclusion rules',
          'Refresh pulls the latest FHIR observations after consent',
        ]}
        ctaLabel="Review conditions"
        ctaHref="/health/conditions"
      />
    </div>
  );
}
