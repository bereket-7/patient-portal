'use client';

import {
  ENROLLMENT_STAGE_LABELS,
  ENROLLMENT_STAGE_ORDER,
  type EnrollmentStage,
  type TrialMatch,
} from '@/lib/mock/trial-matches';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

function stageIndex(stage: EnrollmentStage): number {
  return ENROLLMENT_STAGE_ORDER.indexOf(stage);
}

export function EnrollmentStepper({ match }: { match: TrialMatch }) {
  const currentIndex = stageIndex(match.currentStage);

  return (
    <ol className="space-y-0">
      {ENROLLMENT_STAGE_ORDER.map((stage, index) => {
        const completed = index < currentIndex;
        const current = index === currentIndex;
        const upcoming = index > currentIndex;

        return (
          <li key={stage} className="relative flex gap-4 pb-8 last:pb-0">
            {index < ENROLLMENT_STAGE_ORDER.length - 1 && (
              <span
                className={cn(
                  'absolute left-4 top-8 h-full w-0.5 -translate-x-1/2',
                  completed ? 'bg-primary' : 'bg-border',
                )}
                aria-hidden
              />
            )}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                completed && 'border-primary bg-primary text-primary-foreground',
                current && 'border-primary bg-background text-primary',
                upcoming && 'border-muted-foreground/30 bg-background text-muted-foreground',
              )}
            >
              {completed ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={cn(
                  'text-sm font-medium',
                  current && 'text-primary',
                  upcoming && 'text-muted-foreground',
                )}
              >
                {ENROLLMENT_STAGE_LABELS[stage]}
              </p>
              {current && (
                <p className="mt-1 text-sm text-muted-foreground">{match.nextStep}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
