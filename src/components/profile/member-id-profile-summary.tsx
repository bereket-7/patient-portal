'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, ExternalLink, QrCode, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShareQrCode } from '@/components/share/share-qr-code';
import { formatDateTime } from '@/lib/format-date';
import { getStableMemberVerifyUrl } from '@/lib/member-verify-cache';
import { getDisplayName } from '@/lib/types/patient-account';
import { usePatientAccount } from '@/providers/patient-account-provider';

export function MemberIdProfileSummary() {
  const { account } = usePatientAccount();
  const [verifyUrl, setVerifyUrl] = useState('');
  const [loading, setLoading] = useState(false);

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

  if (!account) return null;

  if (!memberId) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Digital Member ID</CardTitle>
          </div>
          <CardDescription>
            Your TrialClinIQ Member ID is issued after platform consent and HealthEx linking.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Shield className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Complete consent to receive your digital member card with provider verification QR.</p>
          </div>
          <Button asChild size="sm">
            <Link href="/connect/consent">Complete consent</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="border-b bg-brand-gradient-soft pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Digital Member ID</CardTitle>
              <Badge variant="success">Active</Badge>
            </div>
            <CardDescription className="mt-1">
              Show this card or QR code to verify your TrialClinIQ research membership.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/member-id">
              Open full card
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                {account.firstName[0]}
                {account.lastName[0]}
              </div>
              <div>
                <p className="font-semibold">{getDisplayName(account)}</p>
                <p className="text-xs text-muted-foreground">DOB {account.dateOfBirth}</p>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                TrialClinIQ Member ID
              </p>
              <p className="mt-1 font-mono text-xl font-semibold text-primary">{memberId}</p>
              {enrolledAt ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Member since {formatDateTime(enrolledAt)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href="/profile/member-id">View · Print · Download</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile/welcome">Welcome letter</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 border-t bg-background p-6 lg:border-l lg:border-t-0">
            <div className="flex items-center gap-2 text-sm font-medium">
              <QrCode className="h-4 w-4 text-primary" />
              Provider verify
            </div>
            {loading ? (
              <div className="h-[180px] w-[180px] animate-pulse rounded-lg bg-muted" />
            ) : (
              <ShareQrCode value={verifyUrl} size={180} />
            )}
            <p className="max-w-[200px] text-center text-xs text-muted-foreground">
              Scan to verify membership — no clinical data in the QR.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
