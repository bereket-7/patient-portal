'use client';

import { ClipboardCheck } from 'lucide-react';
import { ParticipationCard } from '@/components/trials/participation-card';
import { PageCtaBanner } from '@/components/layout/page-cta-banner';
import { SoftCtaSection } from '@/components/layout/soft-cta-section';
import { getParticipationSummary, getTrialMatches } from '@/lib/mock/trial-matches';

export default function ParticipationPage() {
  const matches = getTrialMatches();
  const summary = getParticipationSummary();

  const activeMatches = matches.filter(
    (m) => m.status !== 'Enrolled' || m.currentStage === 'enrolled',
  );

  return (
    <div className="space-y-8">
      <PageCtaBanner
        tone="primary"
        eyebrow="Your journey"
        title="Follow every step from match to enrollment"
        description="See where each opportunity stands — coordinator review, screening, or enrolled — and know what comes next without digging through operational status screens."
        ctaLabel="Browse matches"
        ctaHref="/trials"
        secondaryLabel="Privacy & consent"
        secondaryHref="/consent"
        imageSrc="/images/hand.jpg"
        imageAlt="Patient participation in clinical research"
      />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My participation</h1>
        <p className="text-sm text-muted-foreground">
          Track your clinical trial matches and enrollment progress.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{summary.underReview}</p>
          <p className="text-xs text-muted-foreground">Under coordinator review</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-2xl font-bold text-primary">{summary.screening}</p>
          <p className="text-xs text-muted-foreground">In screening</p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-2xl font-bold text-green-700">{summary.enrolled}</p>
          <p className="text-xs text-muted-foreground">Enrolled</p>
        </div>
      </div>

      <div className="space-y-4">
        {activeMatches.map((match) => (
          <ParticipationCard key={match.id} match={match} />
        ))}
      </div>

      <SoftCtaSection
        icon={ClipboardCheck}
        title="Preparing for screening?"
        description="Bring an up-to-date medication list to screening visits. Coordinators use it to confirm eligibility and safety."
        points={[
          'Review active prescriptions before appointments',
          'Ask about any paused or stopped medications',
          'Confirm consent still reflects your preferences',
        ]}
        ctaLabel="Open medication list"
        ctaHref="/health/medications"
      />
    </div>
  );
}
