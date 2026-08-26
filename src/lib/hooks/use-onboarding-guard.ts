'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@trialcliniq/shared-ui';
import { usePatientAccount } from '@/providers/patient-account-provider';
import { getRegistrationStep, isRegistrationComplete } from '@/lib/types/patient-account';
import { loadAccount } from '@/lib/mock/patient-account-store';
import { isPatientAuthenticated } from '@/lib/patient-auth';

const REGISTRATION_ROUTES = ['/register', '/verify-email'];
const PORTAL_ROUTES_PREFIX = ['/dashboard', '/connect', '/trials', '/health', '/profile', '/consent', '/participation', '/privacy', '/share'];

const REGISTRATION_ROUTE_MAP: Record<Exclude<ReturnType<typeof getRegistrationStep>, 'complete'>, string> = {
  register: '/register',
  'verify-email': '/verify-email',
};

function isRegistrationRoute(pathname: string) {
  return REGISTRATION_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

function isPortalRoute(pathname: string) {
  return PORTAL_ROUTES_PREFIX.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

function hasGatewaySession(sessionToken: string | undefined): boolean {
  return Boolean(sessionToken && isPatientAuthenticated());
}

export function useOnboardingGuard(mode: 'registration' | 'login' | 'portal') {
  const { account, loading: accountLoading } = usePatientAccount();
  const { session, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const loading = accountLoading || authLoading;

  useEffect(() => {
    if (loading) return;

    const effectiveAccount = account ?? loadAccount();
    const gatewayOk = hasGatewaySession(session.token);

    if (mode === 'registration') {
      // /register is always available so a new patient can start (or restart)
      // even if this browser already has a completed local account.
      if (pathname === '/register' || pathname.startsWith('/register/')) {
        return;
      }

      const step = getRegistrationStep(effectiveAccount);
      if (step === 'complete') {
        router.replace('/login');
        return;
      }

      const target = REGISTRATION_ROUTE_MAP[step];
      if (pathname !== target) {
        router.replace(target);
      }
      return;
    }

    if (mode === 'login') {
      if (effectiveAccount?.isLoggedIn && gatewayOk) {
        router.replace('/dashboard');
      }
      return;
    }

    if (mode === 'portal') {
      if (!effectiveAccount || !isRegistrationComplete(effectiveAccount)) {
        router.replace('/register');
        return;
      }
      if (!effectiveAccount.isLoggedIn || !gatewayOk) {
        router.replace('/login');
      }
    }
  }, [account, loading, mode, pathname, router, session.token]);

  return { account, loading };
}

export { isRegistrationRoute, isPortalRoute };
