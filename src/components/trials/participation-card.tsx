import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ENROLLMENT_STAGE_LABELS,
  getStageProgress,
  type TrialMatch,
} from '@/lib/mock/trial-matches';
import { formatDateTime } from '@/lib/format-date';

const statusVariant: Record<TrialMatch['status'], 'default' | 'secondary' | 'success' | 'warning'> = {
  Matched: 'success',
  'Under Review': 'warning',
  Enrolled: 'default',
  Interested: 'secondary',
};

export function ParticipationCard({ match }: { match: TrialMatch }) {
  const progress = getStageProgress(match.currentStage);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{match.trialName}</CardTitle>
            <CardDescription>
              {match.sponsor} · {match.phase}
            </CardDescription>
          </div>
          <Badge variant={statusVariant[match.status]}>{match.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="shrink-0 text-muted-foreground">Enrollment progress</span>
            <span className="min-w-0 truncate text-right font-medium">
              {ENROLLMENT_STAGE_LABELS[match.currentStage]}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <p className="text-sm text-muted-foreground">{match.nextStep}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Updated {formatDateTime(match.lastUpdated)}
          </p>
          <Button variant="outline" size="sm" asChild className="gap-1">
            <Link href={`/trials/${match.id}`}>
              View details
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
