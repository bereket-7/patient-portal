'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, Loader2, Pill } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageCtaBanner } from '@/components/layout/page-cta-banner';
import { SoftCtaSection } from '@/components/layout/soft-cta-section';
import { useTrialMatches } from '@/lib/hooks/use-trial-matches';
import type { TrialMatch } from '@/lib/mock/trial-matches';

const statusVariant: Record<TrialMatch['status'], 'default' | 'secondary' | 'success' | 'warning'> = {
  Matched: 'success',
  'Under Review': 'warning',
  Enrolled: 'default',
  Interested: 'secondary',
};

function TrialCard({ match }: { match: TrialMatch }) {
  function handleInterest(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toast.success('Interest expressed!', {
      description: `We've notified the research team about your interest in "${match.trialName}".`,
    });
  }

  return (
    <Link href={`/trials/${match.id}`} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg">{match.trialName}</CardTitle>
              <CardDescription className="mt-1">
                {match.sponsor} · {match.phase}
              </CardDescription>
            </div>
            <Badge variant={statusVariant[match.status]}>{match.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{match.description}</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Eligibility match</p>
              <p className="text-2xl font-bold text-primary">{match.eligibilityScore}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Nearest site</p>
              <p className="text-sm font-medium">{match.location}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {match.status === 'Matched' ? (
              <Button onClick={handleInterest} className="w-full sm:w-auto">
                Express Interest
              </Button>
            ) : (
              <span />
            )}
            <Button variant="ghost" size="sm" asChild className="gap-1 text-primary">
              <Link href={`/trials/${match.id}`}>
                View details
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function TrialsPage() {
  const { matches, loading, isLive } = useTrialMatches();

  const matched = matches.filter((m) => m.status === 'Matched');
  const reviewing = matches.filter((m) => m.status === 'Under Review');
  const enrolled = matches.filter((m) => m.status === 'Enrolled');

  return (
    <div className="space-y-8">
      <PageCtaBanner
        tone="primary"
        eyebrow="Matched for you"
        title="Clinical trials that fit your health story"
        description="These opportunities are informed by your connected records — including medications, conditions, and observations you authorized for research matching."
        ctaLabel="Track participation"
        ctaHref="/participation"
        secondaryLabel="Review medications"
        secondaryHref="/health/medications"
        imageSrc="/images/research.jpg"
        imageAlt="Clinical trial research opportunity"
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trial matches</h1>
          <p className="text-sm text-muted-foreground">
            {isLive
              ? 'Live matches from trial-registry eligibility rules.'
              : 'Matched to your profile with eligibility scoring and site proximity.'}
            {loading && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Updating…
              </span>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/participation">View participation progress</Link>
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({matches.length})</TabsTrigger>
          <TabsTrigger value="matched">Matched ({matched.length})</TabsTrigger>
          <TabsTrigger value="review">Under Review ({reviewing.length})</TabsTrigger>
          <TabsTrigger value="enrolled">Enrolled ({enrolled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4 space-y-4">
          {matches.map((m) => (
            <TrialCard key={m.id} match={m} />
          ))}
        </TabsContent>
        <TabsContent value="matched" className="mt-4 space-y-4">
          {matched.map((m) => (
            <TrialCard key={m.id} match={m} />
          ))}
        </TabsContent>
        <TabsContent value="review" className="mt-4 space-y-4">
          {reviewing.map((m) => (
            <TrialCard key={m.id} match={m} />
          ))}
        </TabsContent>
        <TabsContent value="enrolled" className="mt-4 space-y-4">
          {enrolled.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No enrolled trials yet.</p>
          ) : (
            enrolled.map((m) => (
              <TrialCard key={m.id} match={m} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <SoftCtaSection
        icon={Pill}
        title="Medications improve match quality"
        description="If your prescription list changed recently, refresh from HealthEx so eligibility scoring stays accurate."
        points={[
          'Active medications inform inclusion and exclusion rules',
          'You choose when to express interest in a match',
          'Human coordinators review before screening outreach',
        ]}
        ctaLabel="Update medications"
        ctaHref="/health/medications"
      />
    </div>
  );
}
