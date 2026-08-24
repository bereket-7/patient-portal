'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SoftCtaSectionProps = {
  title: string;
  description: string;
  points?: string[];
  ctaLabel: string;
  ctaHref: string;
  icon?: LucideIcon;
  className?: string;
};

export function SoftCtaSection({
  title,
  description,
  points = [],
  ctaLabel,
  ctaHref,
  icon: Icon,
  className,
}: SoftCtaSectionProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border bg-card p-6 shadow-sm sm:p-8 animate-in fade-in-0 duration-500',
        className,
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          {points.length > 0 && (
            <ul className="space-y-2 pt-1">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-foreground/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button asChild className="shrink-0 gap-1 self-start">
          <Link href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
