import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrialMatch } from '@/lib/mock/trial-matches';

const statusVariant: Record<TrialMatch['status'], 'default' | 'secondary' | 'success' | 'warning'> = {
  Matched: 'success',
  'Under Review': 'warning',
  Enrolled: 'default',
  Interested: 'secondary',
};

export function TrialMatchesPreview({ matches }: { matches: TrialMatch[] }) {
  const preview = (Array.isArray(matches) ? matches : []).slice(0, 2);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Trial Matches</CardTitle>
        <Button variant="ghost" size="sm" asChild className="gap-1 text-primary">
          <Link href="/trials">
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {preview.map((match) => (
          <Link
            key={match.id}
            href={`/trials/${match.id}`}
            className="block rounded-lg border p-3 transition-colors hover:border-primary/30 hover:bg-accent/30"
          >
            <div className="flex min-w-0 items-start justify-between gap-2">
              <p className="min-w-0 text-sm font-medium leading-snug">{match.trialName}</p>
              <Badge variant={statusVariant[match.status]} className="shrink-0">
                {match.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{match.sponsor}</p>
            <p className="mt-2 text-xs font-medium text-primary">
              {match.eligibilityScore}% eligibility match · View details
            </p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
