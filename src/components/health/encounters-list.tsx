'use client';

import Link from 'next/link';
import { CalendarDays, ChevronRight, MapPin, Stethoscope, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { encounterClassLabel } from '@/lib/mock/backend-encounters';
import type { EncounterRecord } from '@/lib/types/health-records';
import { formatDateTime } from '@/lib/format-date';
import { cn } from '@/lib/utils';

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  finished: 'success',
  planned: 'secondary',
  'in-progress': 'warning',
  cancelled: 'default',
};

function EncounterCard({ encounter }: { encounter: EncounterRecord }) {
  const statusKey = encounter.status?.toLowerCase() || 'finished';
  const classLabel = encounterClassLabel(encounter.classCode);
  return (
    <Link href={`/health/visits/${encodeURIComponent(encounter.id)}`} className="block group">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold leading-snug group-hover:text-primary">
              {encounter.type}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant[statusKey] || 'secondary'} className="capitalize">
                {encounter.status || 'finished'}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
        <p className="text-xs text-muted-foreground">
          {encounter.date && encounter.date !== '—'
            ? formatDateTime(encounter.date)
            : 'Date not recorded'}
          {classLabel ? ` · ${classLabel}` : ''}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {encounter.reason && (
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Reason: </span>
            {encounter.reason}
          </p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {encounter.facility && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{encounter.facility}</span>
            </div>
          )}
          {encounter.provider && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <User className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{encounter.provider}</span>
            </div>
          )}
        </div>
      </CardContent>
      </Card>
    </Link>
  );
}

type EncountersListProps = {
  encounters: EncounterRecord[];
  className?: string;
  emptyMessage?: string;
};

export function EncountersList({
  encounters,
  className,
  emptyMessage = 'No visits on file yet. Sync from HealthEx or enable dummy clinical data in dev.',
}: EncountersListProps) {
  if (encounters.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...encounters].sort((a, b) => {
    const da = a.date && a.date !== '—' ? new Date(a.date).getTime() : 0;
    const db = b.date && b.date !== '—' ? new Date(b.date).getTime() : 0;
    return db - da;
  });

  return (
    <div className={cn('space-y-4', className)}>
      {sorted.map((encounter) => (
        <EncounterCard key={encounter.id} encounter={encounter} />
      ))}
    </div>
  );
}

export function EncountersSummary({ count, lastVisit }: { count: number; lastVisit?: string }) {
  return (
    <div className="flex flex-wrap gap-4 rounded-xl border bg-card px-5 py-4 text-sm shadow-sm">
      <div className="flex items-center gap-2">
        <Stethoscope className="h-4 w-4 text-primary" />
        <span className="font-medium">{count} visit{count === 1 ? '' : 's'} on record</span>
      </div>
      {lastVisit && (
        <span className="text-muted-foreground">
          Last visit: {formatDateTime(lastVisit)}
        </span>
      )}
    </div>
  );
}
