'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { CalendarDays, ClipboardList, CreditCard, FlaskConical, Shield, ScrollText } from 'lucide-react';
import { AllergiesCard } from '@/components/dashboard/allergies-card';
import { CholesterolChart } from '@/components/dashboard/cholesterol-chart';
import { ConditionsTable } from '@/components/dashboard/conditions-table';
import { DashboardHealthPreview } from '@/components/dashboard/dashboard-health-preview';
import { LastScanCard } from '@/components/dashboard/last-scan-card';
import { TrialMatchesPreview } from '@/components/dashboard/trial-matches-preview';
import { VitalsRow } from '@/components/dashboard/vitals-row';
import { MedicationSpotlight } from '@/components/health/medication-spotlight';
import { PageCtaBanner } from '@/components/layout/page-cta-banner';
import { SoftCtaSection } from '@/components/layout/soft-cta-section';
import { ShareWithProviderCta } from '@/components/share/share-with-provider-cta';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, RefreshCw, Mail } from 'lucide-react';
import { getDisplayName } from '@/lib/types/patient-account';
import { awaitingFhirFetch, hasHealthExLink, needsHealthExEmailConsent } from '@/lib/healthex-consent';
import { usePatientAccount } from '@/providers/patient-account-provider';
import { useHealthRecords } from '@/lib/hooks/use-health-records';
import { useTrialMatches } from '@/lib/hooks/use-trial-matches';

const QUICK_LINKS: {
  href: string;
  label: string;
  description: string;
  icon: typeof Shield;
}[] = [
  {
    href: '/profile',
    label: 'Profile & Member ID',
    description: 'Account details and digital member card',
    icon: CreditCard,
  },
  {
    href: '/health/visits',
    label: 'Visits & Encounters',
    description: 'FHIR encounter history from HealthEx',
    icon: CalendarDays,
  },
  {
    href: '/consent',
    label: 'Consent & Privacy',
    description: 'Manage research authorization',
    icon: Shield,
  },
  {
    href: '/participation',
    label: 'My Participation',
    description: 'Track enrollment progress',
    icon: FlaskConical,
  },
  {
    href: '/privacy/access-log',
    label: 'Data Access Log',
    description: 'Who accessed your data',
    icon: ScrollText,
  },
  {
    href: '/trials',
    label: 'Trial Matches',
    description: 'View matched clinical trials',
    icon: ClipboardList,
  },
];

export default function DashboardPage() {
  const { account } = usePatientAccount();
  const {
    records,
    connected,
    hasLiveData,
    refreshing,
    error,
    lastFetchedAt,
    refreshMedicalData,
  } = useHealthRecords();
  const { matches } = useTrialMatches();
  const summary = useMemo(
    () => ({
      underReview: matches.filter((m) => m.currentStage === 'under_review').length,
      screening: matches.filter((m) => m.currentStage === 'screening').length,
      enrolled: matches.filter((m) => m.status === 'Enrolled').length,
    }),
    [matches],
  );

  const pendingFhir = awaitingFhirFetch(account);
  const healthexLinked = hasHealthExLink(account);
  const awaitingEmailConsent = needsHealthExEmailConsent(account);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome{account ? `, ${getDisplayName(account)}` : ''}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {connected
              ? hasLiveData
                ? 'Your HealthEx medical record is loaded — explore medications, conditions, and trials.'
                : refreshing
                  ? 'Loading your FHIR clinical record from HealthEx…'
                  : 'HealthEx is connected — fetch or refresh medical data if records look incomplete.'
              : pendingFhir
                ? 'HealthEx consent is approved — authorize TrialClinIQ to fetch your FHIR records.'
                : awaitingEmailConsent
                  ? 'HealthEx will email you to grant consent. Complete that step before any medical data can be connected.'
                  : healthexLinked
                    ? 'HealthEx patient linked — check your email and sync consent status.'
                    : 'Register with HealthEx first — you must approve consent via email before connecting medical data.'}
          </p>
          {lastFetchedAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Last medical fetch: {new Date(lastFetchedAt).toLocaleString()}
            </p>
          )}
        </div>
        {connected && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshMedicalData()}
            disabled={refreshing}
            className="gap-2"
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {refreshing ? 'Fetching…' : 'Refresh medical data'}
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {awaitingEmailConsent && (
        <Alert className="border-amber-200 bg-amber-50/80 text-amber-950">
          <Mail className="h-4 w-4" />
          <AlertTitle>Complete HealthEx consent first</AlertTitle>
          <AlertDescription className="mt-1 space-y-2">
            <p>
              After signup, HealthEx sends a consent request to your email. Open that message and
              approve access in the HealthEx wallet before TrialClinIQ can connect your records.
            </p>
            <ol className="list-decimal space-y-1 pl-4 text-sm">
              <li>Check your inbox (and spam) for the HealthEx consent email.</li>
              <li>Grant research consent for your HealthEx patient record.</li>
              <li>Return to Connect and tap <strong>Sync from HealthEx</strong>.</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {!connected ? (
        <PageCtaBanner
          tone="primary"
          eyebrow={
            pendingFhir ? 'HealthEx consented' : awaitingEmailConsent ? 'Consent pending' : 'Get started'
          }
          title={
            pendingFhir
              ? 'Authorize TrialClinIQ to fetch your records'
              : awaitingEmailConsent
                ? 'Approve HealthEx consent from your email'
                : 'Consent first — then connect your records'
          }
          description={
            pendingFhir
              ? 'HealthEx confirmed your consent. Authorize TrialClinIQ to pull your FHIR record and unlock trial matching.'
              : awaitingEmailConsent
                ? 'Medical data stays blocked until HealthEx confirms CONSENTED. Complete the email consent step, then sync here.'
                : 'TrialClinIQ links to HealthEx at registration. You must approve HealthEx consent before any clinical data is accessed.'
          }
          ctaLabel={
            pendingFhir
              ? 'Authorize & fetch records'
              : awaitingEmailConsent
                ? 'Check consent status'
                : 'Start HealthEx connection'
          }
          ctaHref={pendingFhir ? '/connect/consent' : '/connect/healthex'}
          secondaryLabel={pendingFhir ? 'Review HealthEx status' : 'How consent works'}
          secondaryHref={pendingFhir ? '/connect/healthex' : '/consent'}
          imageSrc="/images/hand.jpg"
          imageAlt="Patient connecting health records"
        />
      ) : (
        <>
          <PageCtaBanner
            tone="primary"
            eyebrow="Your care journey"
            title="Your health profile is ready for intelligent matching"
            description="Explore medications, review trial matches, and follow participation progress — all grounded in records you authorized through HealthEx."
            ctaLabel="Browse trial matches"
            ctaHref="/trials"
            secondaryLabel="My participation"
            secondaryHref="/participation"
            imageSrc="/images/doctor.jpg"
            imageAlt="Care and clinical research partnership"
          />

          {(summary.underReview > 0 || summary.screening > 0 || summary.enrolled > 0) && (
            <div className="flex flex-wrap gap-3 rounded-2xl border bg-card px-5 py-4 text-sm shadow-sm">
              <span className="font-medium">Participation status</span>
              {summary.underReview > 0 && (
                <span className="text-amber-700">
                  {summary.underReview} trial{summary.underReview > 1 ? 's' : ''} under review
                </span>
              )}
              {summary.screening > 0 && (
                <span className="text-primary">{summary.screening} in screening</span>
              )}
              {summary.enrolled > 0 && (
                <span className="text-green-700">{summary.enrolled} enrolled</span>
              )}
              <Link href="/participation" className="text-primary hover:underline sm:ml-auto">
                View all
              </Link>
            </div>
          )}

          <MedicationSpotlight medications={records.medications} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex items-start gap-3 p-4">
                    <link.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{link.label}</p>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}

      {connected ? (
        <>
          {!hasLiveData && (
            <Alert className="border-primary/20 bg-accent/30">
              <AlertTitle className="text-sm font-medium">
                {refreshing ? 'Loading medical data…' : 'Medical data not loaded yet'}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {refreshing ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Pulling your FHIR clinical summary from HealthEx.
                  </span>
                ) : (
                  <>
                    Use <strong>Refresh medical data</strong> above to fetch your FHIR record from
                    HealthEx and populate vitals, conditions, and labs.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
          <ShareWithProviderCta />
          <VitalsRow vitals={records.vitals} />
          <div className="grid gap-4 lg:grid-cols-3">
            <LastScanCard scan={records.lastScan} />
            <CholesterolChart readings={records.cholesterol} />
            <ConditionsTable conditions={records.conditions} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <AllergiesCard allergies={records.allergies} />
            <TrialMatchesPreview matches={matches} />
          </div>
          <SoftCtaSection
            icon={Shield}
            title="Your privacy stays in your hands"
            description="You can review, revoke, or renew research consent at any time. Access logs show exactly who used your data for matching."
            points={[
              'Consent is research-purpose only (RESRCH)',
              'Revocation blocks new PHI access quickly',
              'Transparent access history available anytime',
            ]}
            ctaLabel="Manage consent"
            ctaHref="/consent"
          />
        </>
      ) : (
        <DashboardHealthPreview
          ctaHref={pendingFhir ? '/connect/consent' : '/connect/healthex'}
          ctaLabel={
            pendingFhir
              ? 'Authorize & fetch records'
              : awaitingEmailConsent
                ? 'Check consent status'
                : 'Connect HealthEx'
          }
          message={
            pendingFhir
              ? 'HealthEx consent is approved — authorize TrialClinIQ to pull your record and unlock this dashboard.'
              : awaitingEmailConsent
                ? 'Complete the HealthEx email consent step, then sync to unlock vitals, labs, and conditions.'
                : 'Link HealthEx to see vitals, imaging, cholesterol trends, and conditions in one place.'
          }
        />
      )}
    </div>
  );
}
