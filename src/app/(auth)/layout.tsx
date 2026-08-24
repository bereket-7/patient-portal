'use client';

import { OnboardingGuard } from '@/components/layout/onboarding-guard';

/** Minimal wrapper for auth route groups that supply their own shell. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
