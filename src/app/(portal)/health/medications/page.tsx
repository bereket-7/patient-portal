'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { MedicationSpotlight } from '@/components/health/medication-spotlight';
import { PageCtaBanner } from '@/components/layout/page-cta-banner';
import { SoftCtaSection } from '@/components/layout/soft-cta-section';
import { useHealthRecords } from '@/lib/hooks/use-health-records';
import type { MedicationRecord } from '@/lib/types/health-records';
import { FlaskConical, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const { records, connected, refreshing, error, refreshMedicalData } = useHealthRecords();

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

      {connected && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={refreshing}
            onClick={() => void refreshMedicalData()}
          >
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh from HealthEx
          </Button>
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <MedicationSpotlight medications={records.medications} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Full medication list</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <DataTable
            columns={columns}
            data={records.medications}
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
