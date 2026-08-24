'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { FlaskConical, Loader2, RefreshCw } from 'lucide-react';
import { BackendClinicalPayload } from '@/components/health/backend-clinical-payload';
import { MedicationSpotlight } from '@/components/health/medication-spotlight';
import { PageCtaBanner } from '@/components/layout/page-cta-banner';
import { SoftCtaSection } from '@/components/layout/soft-cta-section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { useHealthRecords } from '@/lib/hooks/use-health-records';
import {
  MOCK_BACKEND_CLINICAL_MEDICATIONS,
  resolveMedications,
} from '@/lib/mock/backend-clinical';
import type { MedicationRecord } from '@/lib/types/health-records';

const columns: ColumnDef<MedicationRecord>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column} title="Medication" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'dosage',
    header: ({ column }) => <SortableHeader column={column} title="Dosage" />,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant =
        status === 'Active' ? 'success' : status === 'Stopped' ? 'destructive' : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'prescribedDate',
    header: ({ column }) => <SortableHeader column={column} title="Prescribed" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('prescribedDate')}</span>
    ),
  },
];

export default function MedicationsPage() {
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
  const { medications, usingSample } = resolveMedications(records.medications);

  return (
    <div className="space-y-8">
      <PageCtaBanner
        tone="primary"
        eyebrow="Your prescriptions"
        title="Medications that power safer trial matching"
        description="Review your active and past prescriptions from HealthEx. Keeping this list accurate helps research teams understand eligibility and prepare safer screening visits."
        ctaLabel="View observations"
        ctaHref="/health/observations"
        secondaryLabel="Manage consent"
        secondaryHref="/consent"
        imageSrc="/images/medicalrecord.jpg"
        imageAlt="Patient medication and medical record review"
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Medications</h1>
          <p className="text-sm text-muted-foreground">
            {usingSample &&
              'Sample medications mapped from the HealthEx clinical.medications contract — live ingest will replace these.'}
            {!usingSample && dataSource === 'database' && 'Loaded from clinical profile database.'}
            {!usingSample &&
              dataSource === 'dummy' &&
              useDummyHealthData &&
              'Showing dev dummy medications (Postgres-backed).'}
            {!usingSample && dataSource === 'live' && 'Synced from HealthEx FHIR bundle.'}
            {!usingSample && dataSource === 'none' && connected && 'No medications loaded yet.'}
            {!usingSample && !connected && 'Authorize platform consent to view your prescriptions.'}
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
            the same <code className="text-xs">clinical.medications</code> fields ingestion returns (
            <code className="text-xs">name</code>, <code className="text-xs">status</code>). Dosage and
            prescribed date are <code className="text-xs">—</code> until a richer FHIR mapping is available.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <MedicationSpotlight medications={medications} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full medication list</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable
            columns={columns}
            data={medications}
            searchPlaceholder="Search medications…"
            emptyMessage="No medications on file."
            filters={[
              {
                columnId: 'status',
                label: 'Status',
                options: [
                  { label: 'Active', value: 'Active' },
                  { label: 'Completed', value: 'Completed' },
                  { label: 'Stopped', value: 'Stopped' },
                ],
              },
            ]}
          />
        </CardContent>
      </Card>

      {usingSample && (
        <BackendClinicalPayload
          payload={MOCK_BACKEND_CLINICAL_MEDICATIONS}
          title="Backend clinical.medications JSON"
          description="Same HealthEx ingest fields the portal maps into the medication list."
        />
      )}

      <SoftCtaSection
        icon={FlaskConical}
        title="Ready for research matching?"
        description="Your medication profile is part of how TrialClinIQ finds clinical trials that fit your health story — securely and with your consent."
        points={[
          'Medication history informs eligibility rules',
          'You control sharing through research consent',
          'Coordinators review matches before outreach',
        ]}
        ctaLabel="See trial matches"
        ctaHref="/trials"
      />
    </div>
  );
}
