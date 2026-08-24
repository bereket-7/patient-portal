'use client';

import { OnboardingGuard } from '@/components/layout/onboarding-guard';
import { DemoModeBanner } from '@/components/layout/demo-mode-banner';
import { PortalFooter } from './portal-footer';
import { PortalHeader } from './portal-header';
import { useConsentRevalidation } from '@/lib/hooks/use-consent-revalidation';

function ConsentRevalidation() {
  useConsentRevalidation();
  return null;
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGuard mode="portal">
      <ConsentRevalidation />
      <div className="flex min-h-screen flex-col bg-brand-gradient-soft">
        <DemoModeBanner />
        <PortalHeader />
        <main className="mx-auto w-full max-w-[1400px] flex-1 p-4 lg:p-6">{children}</main>
        <PortalFooter />
      </div>
    </OnboardingGuard>
  );
}
