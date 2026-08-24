'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Printer, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MemberIdPrintCard } from '@/components/profile/member-id-print-card';
import { formatDateTime } from '@/lib/format-date';
import { downloadMemberIdCardPng } from '@/lib/member-id-card-artwork';
import { getStableMemberVerifyUrl } from '@/lib/member-verify-cache';
import { getDisplayName } from '@/lib/types/patient-account';
import { usePatientAccount } from '@/providers/patient-account-provider';

export function MemberIdCardView() {
  const { account } = usePatientAccount();
  const [verifyUrl, setVerifyUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const memberId = account?.enterprisePatientId;
  const firstName = account?.firstName || '';
  const lastName = account?.lastName || '';
  const enrolledAt = account?.consentGrantedAt || account?.lastIngestAt;

  const loadVerifyUrl = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const result = await getStableMemberVerifyUrl({
        enterprisePatientId: memberId,
        firstName,
        lastName,
      });
      setVerifyUrl(result.verifyUrl);
    } catch {
      toast.error('Could not generate verification QR');
    } finally {
      setLoading(false);
    }
  }, [memberId, firstName, lastName]);

  useEffect(() => {
    void loadVerifyUrl();
  }, [loadVerifyUrl]);

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPng() {
    if (!verifyUrl || !memberId || !account) return;
    setDownloading(true);
    try {
      await downloadMemberIdCardPng(
        {
          displayName: getDisplayName(account),
          memberId,
          dateOfBirth: account.dateOfBirth,
          enrolledLabel: enrolledAt
            ? `Member since ${formatDateTime(enrolledAt)}`
            : undefined,
          verifyUrl,
        },
        `trialcliniq-member-id-${memberId}.png`,
      );
      toast.success('Member ID card downloaded');
    } catch {
      toast.error('Download failed — try Print instead');
    } finally {
      setDownloading(false);
    }
  }

  if (!account) return null;

  if (!memberId) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Member ID not yet assigned</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Your TrialClinIQ Member ID is created when you complete platform consent and link
            your HealthEx records.
          </p>
          <Button asChild size="sm">
            <Link href="/connect/consent">Complete consent</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="member-id-page space-y-6 print:space-y-0">
      <div className="flex flex-wrap items-start justify-between gap-4" data-print-hide="true">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Digital Member ID</h1>
          <p className="text-sm text-muted-foreground">
            View, download, or share your TrialClinIQ member card with healthcare providers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleDownloadPng()}
            disabled={downloading || loading || !verifyUrl}
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading ? 'Generating…' : 'Download PNG'}
          </Button>
        </div>
      </div>

      <div className="print:flex print:min-h-[100vh] print:items-center print:justify-center print:p-8">
        <MemberIdPrintCard account={account} verifyUrl={verifyUrl} loading={loading} />
      </div>

      <Card data-print-hide="true">
        <CardHeader>
          <CardTitle className="text-base">How to use your digital member ID</CardTitle>
          <CardDescription>
            Access this card anytime from your profile on mobile or desktop.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Show the QR code at your clinic for quick membership verification.</p>
          <p>• Download a high-resolution PNG or print a wallet-sized copy for your records.</p>
          <p>
            • For sharing clinical records, use{' '}
            <Link href="/profile/share" className="text-primary underline">
              Share with provider
            </Link>{' '}
            (requires OTP authorization).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
