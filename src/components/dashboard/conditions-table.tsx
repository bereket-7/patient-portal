'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import type { ConditionRecord } from '@/lib/types/health-records';
import { cn } from '@/lib/utils';

const severityVariant: Record<ConditionRecord['severity'], string> = {
  Mild: 'bg-blue-50 text-blue-700 border-blue-200',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-200',
  Severe: 'bg-red-50 text-red-700 border-red-200',
  Complaint: 'bg-purple-50 text-purple-700 border-purple-200',
};

const columns: ColumnDef<ConditionRecord>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'period',
    header: ({ column }) => <SortableHeader column={column} title="Period" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue('period')}</span>
    ),
  },
  {
    accessorKey: 'severity',
    header: ({ column }) => <SortableHeader column={column} title="Severity" />,
    cell: ({ row }) => {
      const severity = row.getValue('severity') as ConditionRecord['severity'];
      return (
        <Badge variant="outline" className={cn('font-normal', severityVariant[severity])}>
          {severity}
        </Badge>
      );
    },
  },
];

export function ConditionsTable({ conditions }: { conditions: ConditionRecord[] }) {
  const data = Array.isArray(conditions) ? conditions : [];
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Conditions</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Search conditions…"
          emptyMessage="No conditions on file."
          filters={[
            {
              columnId: 'severity',
              label: 'Severity',
              options: [
                { label: 'Mild', value: 'Mild' },
                { label: 'Moderate', value: 'Moderate' },
                { label: 'Severe', value: 'Severe' },
                { label: 'Complaint', value: 'Complaint' },
              ],
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
