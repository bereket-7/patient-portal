'use client';

import Link from 'next/link';
import { FileText, Printer, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDateTime } from '@/lib/format-date';
import { getDisplayName } from '@/lib/types/patient-account';
import { usePatientAccount } from '@/providers/patient-account-provider';

export function WelcomeLetterView() {
  const { account } = usePatientAccount();
  if (!account) return null;

  const enrollmentDate = account.phoneVerified
    ? formatDateTime(new Date().toISOString())
    : 'Pending verification';
  const memberId = account.enterprisePatientId || 'Assigned after consent';

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome Letter</h1>
          <p className="text-sm text-muted-foreground">
            Your digital welcome letter — available immediately after enrollment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print / Save PDF
          </Button>
        </div>
      </div>

      <Card id="welcome-letter" className="mx-auto max-w-2xl print:border-none print:shadow-none">
        <CardHeader className="border-b bg-muted/30 print:bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gradient-button text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>TrialClinIQ Research Program</CardTitle>
              <CardDescription>Digital Welcome Letter</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-8 text-sm leading-relaxed">
          <p>{formatDateTime(new Date().toISOString())}</p>

          <p>Dear {getDisplayName(account)},</p>

          <p>
            Welcome to the <strong>TrialClinIQ Research Program</strong>. Your enrollment is
            complete and your digital member account is now active. This letter replaces a
            physical welcome packet — you can access it, download, or print it at any time.
          </p>

          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Your membership details
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <strong>Member name:</strong> {getDisplayName(account)}
              </li>
              <li>
                <strong>Enrollment date:</strong> {enrollmentDate}
              </li>
              <li>
                <strong>TrialClinIQ Member ID:</strong>{' '}
                <span className="font-mono">{memberId}</span>
              </li>
              <li>
                <strong>Portal email:</strong> {account.email}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold">About your program</h2>
            <p className="mt-2">
              TrialClinIQ helps connect patients with clinical research opportunities matched to
              their health profile. With your authorization, we securely retrieve health records
              through <strong>HealthEx</strong>, evaluate eligibility against active trials, and
              notify you when a research coordinator identifies a potential match.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold">Your next steps</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>
                <strong>Connect HealthEx</strong> — link your health records wallet so we can
                retrieve authorized clinical data.
              </li>
              <li>
                <strong>Grant research consent</strong> — authorize TrialClinIQ to use your data
                for trial matching (RESRCH purpose).
              </li>
              <li>
                <strong>View your digital member ID</strong> — download your member card for
                provider verification.
              </li>
              <li>
                <strong>Review trial matches</strong> — when eligible trials are found, a site
                coordinator will review before contacting you.
              </li>
            </ol>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-3 print:hidden">
            <Button asChild size="sm">
              <Link href="/connect/healthex">
                Connect HealthEx
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/profile/member-id">View Member ID</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/participation">My Participation</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Questions? Visit your profile or contact your research site coordinator. You may revoke
            consent at any time from the Consent &amp; Privacy section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
