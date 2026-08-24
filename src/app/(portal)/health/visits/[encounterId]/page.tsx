'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  MapPin,
  Stethoscope,
  User,
} from 'lucide-react';
import { BackendEncountersPayload } from '@/components/health/backend-encounters-payload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHealthRecords } from '@/lib/hooks/use-health-records';
import { formatDateTime } from '@/lib/format-date';
import {
  encounterClassLabel,
  findMockBackendEncounter,
  MOCK_MAPPED_ENCOUNTERS,
} from '@/lib/mock/backend-encounters';

export default function EncounterDetailPage() {
  const params = useParams();
  const encounterId = params.encounterId as string;
  const { encounters, connected, dataSource } = useHealthRecords();
  const liveEncounter = encounters.find((e) => e.id === encounterId);
  const sampleEncounter = MOCK_MAPPED_ENCOUNTERS.find((e) => e.id === encounterId);
  const encounter = liveEncounter || sampleEncounter;
  const usingSample = !liveEncounter && Boolean(sampleEncounter);
  const backendRow = findMockBackendEncounter(encounterId);

  if (!encounter) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
        <p className="text-muted-foreground">Visit not found or not loaded yet.</p>
        <Button asChild variant="outline">
          <Link href="/health/visits">Back to visits</Link>
        </Button>
      </div>
    );
  }

  const statusKey = encounter.status?.toLowerCase() || 'finished';
  const classLabel = encounterClassLabel(encounter.classCode);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
        <Link href="/health/visits">
          <ArrowLeft className="h-4 w-4" />
          Back to visits
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary/70">
            FHIR Encounter
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{encounter.type}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {encounter.date && encounter.date !== '—'
              ? formatDateTime(encounter.date)
              : 'Date not recorded'}
            {classLabel ? ` · ${classLabel}` : ''}
          </p>
        </div>
        <Badge variant={statusKey === 'finished' ? 'success' : 'secondary'} className="capitalize">
          {encounter.status || 'finished'}
        </Badge>
      </div>

      {usingSample && (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          Sample encounter from the HealthEx <code>clinical.encounters</code> contract. Live ingest
          will replace this when encounters are present on the clinical profile.
        </p>
      )}

      {dataSource === 'dummy' && !usingSample && (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          Dev dummy encounter — authorized accounts can persist this via Postgres clinical profile.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{encounter.facility || 'Not documented'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" />
              Provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{encounter.provider || 'Not documented'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-primary" />
            Reason for visit
          </CardTitle>
          <CardDescription>From HealthEx FHIR Encounter resource</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {encounter.reason || 'No reason documented for this encounter.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4 text-primary" />
            Clinical context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            This visit is part of your authorized medical record pulled from HealthEx. Related
            observations, conditions, and medications from the same care episode may appear on your
            dashboard and health record pages.
          </p>
          {!connected && (
            <p className="rounded-md bg-muted p-3 text-foreground">
              Complete platform consent to sync live encounters from HealthEx.
            </p>
          )}
        </CardContent>
      </Card>

      {usingSample && backendRow && (
        <BackendEncountersPayload
          payload={backendRow}
          title="Backend encounter row"
          description="Raw clinical.encounters[] object before frontend mapping (class → classCode)."
        />
      )}

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href="/health/conditions">View conditions</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/health/observations">View observations</Link>
        </Button>
        <Button asChild variant="ghost" className="gap-1">
          <Link href="/dashboard">
            <CalendarDays className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
