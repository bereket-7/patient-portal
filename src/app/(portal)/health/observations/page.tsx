'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Activity, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { PageCtaBanner } from '@/components/layout/page-cta-banner';
import { SoftCtaSection } from '@/components/layout/soft-cta-section';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHealthRecords } from '@/lib/hooks/use-health-records';
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
  const { records, connected, refreshing, error, refreshMedicalData } = useHealthRecords();

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

      {connected && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={refreshing}
            onClick={() => void refreshMedicalData()}
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh from HealthEx
          </Button>
        </div>
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
            data={records.observations}
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
