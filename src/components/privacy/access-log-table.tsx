'use client';

import { useEffect, useMemo, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Info } from 'lucide-react';
import { useAuth } from '@trialcliniq/shared-ui';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getAccessLog,
  getEventTypeLabel,
  type AccessLogEntry,
  type AccessLogEventType,
} from '@/lib/mock/access-log';
import { fetchPatientAuditLog, resolvePatientApiId, shouldUseBackendApis } from '@/lib/patient-api';
import { formatDateTime } from '@/lib/format-date';
import { usePatientAccount } from '@/providers/patient-account-provider';

const FILTER_TABS: { value: string; label: string; types?: AccessLogEventType[] }[] = [
  { value: 'all', label: 'All' },
  { value: 'access', label: 'Record Access', types: ['patient_record_access', 'phi_access'] },
  { value: 'consent', label: 'Consent', types: ['consent_validation', 'consent_violation'] },
  { value: 'api', label: 'API', types: ['api_request'] },
];

function outcomeVariant(outcome: AccessLogEntry['outcome']): 'success' | 'destructive' {
  return outcome === 'SUCCESS' ? 'success' : 'destructive';
}

const columns: ColumnDef<AccessLogEntry>[] = [
  {
    accessorKey: 'timestamp',
    header: ({ column }) => <SortableHeader column={column} title="Date / Time" />,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {formatDateTime(row.getValue('timestamp'))}
      </span>
    ),
  },
  {
    id: 'who',
    accessorFn: (row) => `${row.actor} ${row.organization}`,
    header: ({ column }) => <SortableHeader column={column} title="Who" />,
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.actor}</p>
        <p className="text-xs text-muted-foreground">{row.original.organization}</p>
      </div>
    ),
  },
  {
    accessorKey: 'action',
    header: ({ column }) => <SortableHeader column={column} title="Action" />,
    cell: ({ row }) => (
      <div>
        <p className="text-sm">{row.original.action}</p>
        <Badge variant="outline" className="mt-1 text-[10px]">
          {getEventTypeLabel(row.original.eventType)}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'purpose',
    header: ({ column }) => <SortableHeader column={column} title="Purpose" />,
    cell: ({ row }) => <span className="text-sm">{row.getValue('purpose')}</span>,
  },
  {
    accessorKey: 'outcome',
    header: ({ column }) => <SortableHeader column={column} title="Outcome" />,
    cell: ({ row }) => {
      const outcome = row.getValue('outcome') as AccessLogEntry['outcome'];
      return <Badge variant={outcomeVariant(outcome)}>{outcome}</Badge>;
    },
  },
];

export function AccessLogTable() {
  const { account } = usePatientAccount();
  const { session } = useAuth();
  const [tab, setTab] = useState('all');
  const [entries, setEntries] = useState<AccessLogEntry[]>(() => getAccessLog());
  const [source, setSource] = useState<'mock' | 'api'>('mock');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!account || !session.token) return;

    let cancelled = false;

    async function load() {
      if (!shouldUseBackendApis()) {
        setEntries(getAccessLog());
        setSource('mock');
        return;
      }

      try {
        const patientId = resolvePatientApiId(account, session);
        const events = await fetchPatientAuditLog(session, patientId);
        if (cancelled) return;
        if (events.length > 0) {
          setEntries(events);
          setSource('api');
          setLoadError(null);
        } else {
          setEntries(getAccessLog());
          setSource('mock');
        }
      } catch (err) {
        if (cancelled) return;
        setEntries(getAccessLog());
        setSource('mock');
        setLoadError(err instanceof Error ? err.message : 'audit_fetch_failed');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [account, session]);

  const filtered = useMemo(() => {
    const config = FILTER_TABS.find((t) => t.value === tab);
    if (!config?.types) return entries;
    return entries.filter((e) => config.types!.includes(e.eventType));
  }, [entries, tab]);

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Your data access log</AlertTitle>
        <AlertDescription>
          This log shows who accessed your health data through TrialClinIQ, when, and for what
          purpose. Under HIPAA, you have the right to an accounting of disclosures related to your
          protected health information.
          {source === 'api' && ' Showing live audit events from the platform.'}
          {source === 'mock' && loadError && ' Live audit unavailable — showing demo events.'}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Access events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0 pb-2">
          <div className="px-4 pt-1">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                {FILTER_TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <DataTable
            columns={columns}
            data={filtered}
            searchPlaceholder="Search access events…"
            emptyMessage="No events in this category."
            filters={[
              {
                columnId: 'outcome',
                label: 'Outcome',
                options: [
                  { label: 'Success', value: 'SUCCESS' },
                  { label: 'Failure', value: 'FAILURE' },
                ],
              },
              {
                columnId: 'purpose',
                label: 'Purpose',
                options: [{ label: 'RESRCH', value: 'RESRCH' }],
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
