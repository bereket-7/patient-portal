'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePatientAccount } from '@/providers/patient-account-provider';
import { loadAccount } from '@/lib/mock/patient-account-store';
import { syncDevAccountToLocal, type DevPatientAccount } from '@/lib/patient-dev-accounts';
import {
  PatientAccountsApiError,
  patientAccountsErrorMessage,
  resendPatientVerificationEmail,
  verifyPatientEmailToken,
} from '@/lib/patient-accounts-api';
import { markWelcomeLetterAvailable } from '@/lib/welcome-letter';

/** Survives React Strict Mode remounts so we do not treat a successful verify as failure. */
const verifiedByToken = new Map<string, DevPatientAccount>();
const inFlightByToken = new Map<string, Promise<DevPatientAccount>>();

export function EmailVerification() {
  return (
    <Suspense fallback={<EmailVerificationFallback />}>
      <EmailVerificationInner />
    </Suspense>
  );
}

function EmailVerificationFallback() {
  return <div className="h-40 animate-pulse rounded-lg bg-muted/50" />;
}

function EmailVerificationInner() {
  const { account, replaceAccount } = usePatientAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    token ? 'verifying' : 'idle',
  );
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    function finish(verified: DevPatientAccount) {
      const stored = loadAccount();
      const password = stored?.passwordHash || '';
      const next = syncDevAccountToLocal(verified, password);
      replaceAccount(next);
      markWelcomeLetterAvailable(next.id);
      if (cancelled) return;
      setStatus('success');
      if (!redirected.current) {
        redirected.current = true;
        router.replace('/login?registered=1&welcome=1');
      }
    }

    async function confirm() {
      setStatus('verifying');
      try {
        const cached = verifiedByToken.get(token);
        if (cached) {
          finish(cached);
          return;
        }

        let flight = inFlightByToken.get(token);
        if (!flight) {
          flight = verifyPatientEmailToken(token).then((verified) => {
            verifiedByToken.set(token, verified);
            return verified;
          });
          inFlightByToken.set(token, flight);
          void flight.finally(() => {
            inFlightByToken.delete(token);
          });
        }

        const verified = await flight;
        finish(verified);
      } catch (err) {
        if (cancelled || verifiedByToken.has(token)) return;
        setStatus('error');
        setMessage(
          err instanceof PatientAccountsApiError
            ? patientAccountsErrorMessage(err)
            : 'This verification link is invalid. Request a new email.',
        );
      }
    }

    void confirm();
    return () => {
      cancelled = true;
    };
  }, [token, replaceAccount, router]);

  async function handleResend() {
    const email = account?.email;
    if (!email) {
      setStatus('error');
      setMessage('No email is saved in this browser. Register again to get a new link.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await resendPatientVerificationEmail(email);
      setStatus('idle');
      setMessage('A new verification email is on the way. Check your inbox.');
    } catch (err) {
      setStatus('error');
      setMessage(
        err instanceof PatientAccountsApiError
          ? patientAccountsErrorMessage(err)
          : 'Unable to resend the verification email.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        Confirming your email…
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        Email verified. Taking you to sign in…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertTitle>Check your inbox</AlertTitle>
        <AlertDescription>
          We sent a verification link to{' '}
          <strong className="text-foreground">{account?.email || 'your email'}</strong>. Open that
          email and click the link to finish registration.
        </AlertDescription>
      </Alert>

      {message && (
        <p
          className={
            status === 'error'
              ? 'rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
              : 'rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-100'
          }
        >
          {message}
        </p>
      )}

      <Button
        variant="outline"
        onClick={handleResend}
        disabled={busy}
        className="w-full gap-2"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        {busy ? 'Sending…' : 'Resend verification email'}
      </Button>
    </div>
  );
}
