'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'trialcliniq.patient.demo-banner.dismissed';
const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const dummyHealthMode = process.env.NEXT_PUBLIC_USE_DUMMY_HEALTH_DATA === 'true';

export function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  if (dismissed || (!demoMode && !dummyHealthMode)) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-amber-950">
      <div className="mx-auto flex max-w-[1400px] items-start justify-between gap-3 sm:items-center">
        <p className="min-w-0 text-sm leading-relaxed">
          {demoMode && (
            <>
              <span className="font-medium">Demo mode</span>
              {' — '}
              Trial matches and some UI data are simulated.
            </>
          )}
          {demoMode && dummyHealthMode && ' '}
          {dummyHealthMode && (
            <>
              <span className="font-medium">Dummy clinical data</span>
              {' — '}
              Authorized accounts load seeded health records from Postgres when live HealthEx data
              is unavailable.
            </>
          )}
          {!demoMode && dummyHealthMode && (
            <span className="text-amber-900/80">
              {' '}
              Set NEXT_PUBLIC_USE_DUMMY_HEALTH_DATA=false for production.
            </span>
          )}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-amber-800 hover:bg-amber-100 hover:text-amber-950"
          onClick={dismiss}
          aria-label="Dismiss demo banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
