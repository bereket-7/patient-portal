'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  Mail,
  MapPin,
  User,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnrollmentStepper } from '@/components/trials/enrollment-stepper';
import { useTrialMatches } from '@/lib/hooks/use-trial-matches';
import { formatDateTime } from '@/lib/format-date';

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  Matched: 'success',
  'Under Review': 'warning',
  Enrolled: 'default',
  Interested: 'secondary',
};

function CriteriaList({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: typeof CheckCircle2;
  tone: 'inclusion' | 'exclusion';
}) {
  if (!items.length) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon
            className={
              tone === 'inclusion' ? 'h-4 w-4 text-emerald-600' : 'h-4 w-4 text-red-500'
            }
          />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export default function TrialDetailPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { getMatch } = useTrialMatches();
  const match = getMatch(matchId);

  if (!match) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-muted-foreground">Trial match not found.</p>
        <Button asChild variant="outline">
          <Link href="/trials">Back to trial matches</Link>
        </Button>
      </div>
    );
  }

  function handleInterest() {
    toast.success('Interest expressed!', {
      description: `We've notified the research team about your interest in "${match.trialName}".`,
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
        <Link href="/trials">
          <ArrowLeft className="h-4 w-4" />
          Back to matches
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            {match.therapeuticArea && (
              <Badge variant="outline">{match.therapeuticArea}</Badge>
            )}
            <Badge variant="secondary">{match.phase}</Badge>
          </div>
          <h1 className="text-2xl font-semibold">{match.trialName}</h1>
          <p className="text-sm text-muted-foreground">{match.sponsor}</p>
        </div>
        <Badge variant={statusVariant[match.status]}>{match.status}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Eligibility match</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{match.eligibilityScore}%</p>
            <p className="text-xs text-muted-foreground">
              Based on your normalized clinical profile (conditions, meds, labs)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Nearest site</CardTitle>
          </CardHeader>
          <CardContent className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{match.siteName}</p>
              <p className="text-xs text-muted-foreground">{match.location}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FlaskConical className="h-4 w-4 text-primary" />
            Study overview
          </CardTitle>
          <CardDescription>{match.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          {match.studyDesign && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Design
              </p>
              <p className="mt-1">{match.studyDesign}</p>
            </div>
          )}
          {match.estimatedDuration && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Duration
              </p>
              <p className="mt-1">{match.estimatedDuration}</p>
            </div>
          )}
          {match.primaryEndpoint && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Primary endpoint
              </p>
              <p className="mt-1">{match.primaryEndpoint}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <CriteriaList
          title="Key inclusion criteria"
          items={match.inclusionCriteria || []}
          icon={CheckCircle2}
          tone="inclusion"
        />
        <CriteriaList
          title="Key exclusion criteria"
          items={match.exclusionCriteria || []}
          icon={XCircle}
          tone="exclusion"
        />
      </div>

      {match.visitSchedule && match.visitSchedule.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              Visit schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-muted-foreground">
              {match.visitSchedule.map((visit, i) => (
                <li key={visit} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {i + 1}
                  </span>
                  {visit}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enrollment progress</CardTitle>
          <CardDescription>Last updated {formatDateTime(match.lastUpdated)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnrollmentStepper match={match} />
          <p className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Next step: </span>
            {match.nextStep}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            Research site contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{match.coordinatorName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{match.coordinatorEmail}</span>
          </div>
          {match.coordinatorNote && (
            <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Coordinator note: </span>
              {match.coordinatorNote}
            </p>
          )}
        </CardContent>
      </Card>

      {match.status === 'Matched' && (
        <Button onClick={handleInterest} className="w-full sm:w-auto">
          Express Interest
        </Button>
      )}
    </div>
  );
}
