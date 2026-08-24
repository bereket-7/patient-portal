'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConsentForm } from '@/components/connect/consent-form';
import { canAuthorizePlatformConsent } from '@/lib/healthex-consent';
import { usePatientAccount } from '@/providers/patient-account-provider';

export default function ConsentPage() {
  const { account } = usePatientAccount();
  const router = useRouter();

  useEffect(() => {
    if (!account?.isLoggedIn) {
      router.replace('/login');
      return;
    }
    if (!canAuthorizePlatformConsent(account)) {
      router.replace('/connect/healthex');
    }
  }, [account, router]);

  if (!account || !canAuthorizePlatformConsent(account)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <ConsentForm />
    </div>
  );
}
