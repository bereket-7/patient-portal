'use client';

import Link from 'next/link';
import { Link2, Lock } from 'lucide-react';
import { AllergiesCard } from '@/components/dashboard/allergies-card';
import { CholesterolChart } from '@/components/dashboard/cholesterol-chart';
import { ConditionsTable } from '@/components/dashboard/conditions-table';
import { LastScanCard } from '@/components/dashboard/last-scan-card';
import { VitalsRow } from '@/components/dashboard/vitals-row';
import { Button } from '@/components/ui/button';
import { MOCK_HEALTH_RECORDS } from '@/lib/mock/health-records';

type DashboardHealthPreviewProps = {
  ctaHref?: string;
  ctaLabel?: string;
  message?: string;
};

export function DashboardHealthPreview({
  ctaHref = '/connect/healthex',
  ctaLabel = 'Connect HealthEx',
  message = 'Connect HealthEx to unlock vitals, imaging, labs, and conditions from your medical record.',
}: DashboardHealthPreviewProps) {
  const preview = MOCK_HEALTH_RECORDS;

  return (
    <section
      aria-label="Health summary preview"
      className="relative space-y-4 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-b from-accent/40 via-card to-card p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary/70">
              Preview
            </p>
            <h2 className="text-base font-semibold tracking-tight">Your health summary</h2>
            <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <Button asChild size="sm" className="w-full shrink-0 gap-2 sm:w-auto">
          <Link href={ctaHref}>
            <Link2 className="h-4 w-4" />
            {ctaLabel}
          </Link>
        </Button>
      </div>

      <div
        className="pointer-events-none select-none space-y-4 blur-[2px] opacity-[0.72] saturate-50"
        aria-hidden
      >
        <VitalsRow vitals={preview.vitals} />
        <div className="grid gap-4 lg:grid-cols-3">
          <LastScanCard scan={preview.lastScan} />
          <CholesterolChart readings={preview.cholesterol} />
          <ConditionsTable conditions={preview.conditions} />
        </div>
        <AllergiesCard allergies={preview.allergies} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/80 to-transparent" />
    </section>
  );
}
