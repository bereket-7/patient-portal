'use client';

import { useOnboardingGuard } from '@/lib/hooks/use-onboarding-guard';

export function OnboardingGuard({
  mode,
  children,
}: {
  mode: 'registration' | 'login' | 'portal';
  children: React.ReactNode;
}) {
  const { loading } = useOnboardingGuard(mode);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
