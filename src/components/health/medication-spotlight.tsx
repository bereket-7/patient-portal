'use client';

import Link from 'next/link';
import { Pill, RefreshCw, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MedicationRecord } from '@/lib/types/health-records';
import { cn } from '@/lib/utils';

type MedicationSpotlightProps = {
  medications: MedicationRecord[];
  className?: string;
  compact?: boolean;
};

export function MedicationSpotlight({
  medications,
  className,
  compact = false,
}: MedicationSpotlightProps) {
  const list = Array.isArray(medications) ? medications : [];
  const active = list.filter((m) => m.status === 'Active');
  const preview = active.slice(0, 3);

  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-white to-accent/40 shadow-sm animate-in fade-in-0 duration-500',
        className,
      )}
    >
      <div className={cn('grid gap-0', compact ? 'lg:grid-cols-1' : 'lg:grid-cols-[1.2fr_0.8fr]')}>
        <div className="space-y-5 p-4 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary/70">
                Medication overview
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Stay on top of your treatment plan
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Your active prescriptions help TrialClinIQ understand eligibility and safety for
                clinical trial matching. Review them anytime — updates sync from HealthEx.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-2xl font-semibold text-primary">{active.length}</p>
              <p className="text-xs text-muted-foreground">Active medications</p>
            </div>
            <div className="rounded-xl border bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-2xl font-semibold text-foreground">{list.length}</p>
              <p className="text-xs text-muted-foreground">Total on record</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-4 py-3 text-emerald-800">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <p className="text-xs leading-snug">Shared securely for research matching only</p>
            </div>
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Currently active
              </p>
              <ul className="flex flex-wrap gap-2">
                {preview.map((med) => (
                  <li key={med.id}>
                    <Badge
                      variant="outline"
                      className="border-primary/15 bg-white/90 px-3 py-1.5 text-sm font-normal text-foreground"
                    >
                      <span className="font-medium">{med.name}</span>
                      <span className="ml-2 text-muted-foreground">{med.dosage}</span>
                    </Badge>
                  </li>
                ))}
                {active.length > preview.length && (
                  <li>
                    <Badge variant="secondary" className="px-3 py-1.5 font-normal">
                      +{active.length - preview.length} more
                    </Badge>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild>
              <Link href="/health/medications">Review medications</Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/connect/healthex">
                <RefreshCw className="h-4 w-4" />
                Refresh from HealthEx
              </Link>
            </Button>
          </div>
        </div>

        {!compact && (
          <div className="relative hidden min-h-[280px] lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/medicalrecord.jpg"
              alt="Medical records and prescriptions"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary/15" />
            <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-primary/10 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
              <p className="text-sm font-medium text-foreground">Keep your list current</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Accurate medication history improves trial match quality and helps coordinators
                prepare safer screening visits.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
