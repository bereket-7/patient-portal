'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePatientAccount } from '@/providers/patient-account-provider';
import { loadAccount } from '@/lib/mock/patient-account-store';
import { syncDevAccountToLocal, verifyDevPatientEmail } from '@/lib/patient-dev-accounts';

export function EmailVerification() {
  const { account, confirmEmail } = usePatientAccount();
  const router = useRouter();
  const [resent, setResent] = useState(false);

  async function handleVerified() {
    if (account?.email) {
      const verified = await verifyDevPatientEmail(account.email);
      if (verified) {
        const stored = loadAccount();
        const password = stored?.passwordHash || '';
        syncDevAccountToLocal(verified, password);
      } else {
        confirmEmail();
      }
    } else {
      confirmEmail();
    }
    router.push('/verify-phone');
  }

  function handleResend() {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertTitle>Check your inbox</AlertTitle>
        <AlertDescription>
          We sent a verification link to{' '}
          <strong className="text-foreground">{account?.email}</strong>. Click the link in the email
          to verify your address.
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Demo mode</p>
        <p className="mt-1">
          No email is actually sent. Click the button below to simulate clicking the verification
          link.
        </p>
      </div>

      <Button onClick={handleVerified} className="w-full">
        I&apos;ve verified my email
      </Button>

      <Button variant="outline" onClick={handleResend} className="w-full gap-2">
        <RefreshCw className="h-4 w-4" />
        {resent ? 'Email sent!' : 'Resend verification email'}
      </Button>
    </div>
  );
}
