'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@trialcliniq/shared-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { usePatientAccount } from '@/providers/patient-account-provider';
import { loadAccount, saveAccount } from '@/lib/mock/patient-account-store';
import { isRegistrationComplete } from '@/lib/types/patient-account';
import { establishPatientSession } from '@/lib/patient-auth-bridge';
import {
  fetchSeedPatientAccounts,
  loadDevClinicalProfile,
  loginDevPatientAccount,
  syncDevAccountToLocal,
  syncHealthExStatus,
  type DevSeedAccount,
} from '@/lib/patient-dev-accounts';
import type { CachedClinicalRecords } from '@/lib/healthex-clinical';
import { sendWelcomeNotificationIfNeeded } from '@/lib/mock/notifications';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { account, login, replaceAccount } = usePatientAccount();
  const { session, backendConfig, loading: authLoading, updateSession, resetSession } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [seedAccounts, setSeedAccounts] = useState<DevSeedAccount[]>([]);
  const justRegistered = searchParams.get('registered') === '1';

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    const stored = account ?? loadAccount();
    if (stored?.email) {
      form.setValue('email', stored.email);
    }
  }, [account, form]);

  useEffect(() => {
    fetchSeedPatientAccounts().then(setSeedAccounts).catch(() => setSeedAccounts([]));
  }, []);

  function fillSeedAccount(seed: DevSeedAccount) {
    form.setValue('email', seed.email);
    form.setValue('password', seed.password);
  }

  async function onSubmit(values: FormValues) {
    setError('');
    setBusy(true);

    try {
      const devAccount = await loginDevPatientAccount(values.email, values.password);
      if (devAccount) {
        if (!devAccount.emailVerified || !devAccount.phoneVerified) {
          setError('Finish email and phone verification before signing in.');
          syncDevAccountToLocal(devAccount, values.password);
          return;
        }

        // API already validated credentials — mark logged in without a second local check.
        let synced = syncDevAccountToLocal(devAccount, values.password);

        // One status sync only if HealthEx link metadata is incomplete.
        if (!synced.healthExReferenceId || !synced.enterprisePatientId) {
          try {
            const hx = await syncHealthExStatus(synced.email);
            if (hx.account) {
              synced = syncDevAccountToLocal(hx.account, values.password);
            }
          } catch {
            // Non-blocking — Connect page can still sync manually.
          }
        }

        // Prefer durable Postgres clinical snapshot (not live HealthEx).
        try {
          const clinical = await loadDevClinicalProfile(synced.email);
          if (clinical.account) {
            synced = {
              ...synced,
              enterprisePatientId:
                clinical.account.enterprisePatientId || synced.enterprisePatientId,
              healthExReferenceId:
                clinical.account.healthExReferenceId || synced.healthExReferenceId,
              healthExPatientId:
                clinical.account.healthExPatientId || synced.healthExPatientId,
              healthexConsentStatus:
                clinical.account.healthexConsentStatus || synced.healthexConsentStatus,
              healthexRetrievalStatus:
                clinical.account.healthexRetrievalStatus || synced.healthexRetrievalStatus,
              consentReferenceId:
                clinical.account.consentReferenceId || synced.consentReferenceId,
            };
          }
          const snapshot = clinical.portalSnapshot;
          if (
            snapshot &&
            typeof snapshot === 'object' &&
            'records' in snapshot &&
            (snapshot as CachedClinicalRecords).records
          ) {
            const cached = snapshot as CachedClinicalRecords;
            synced = {
              ...synced,
              clinicalCache: {
                ...cached,
                source: 'database',
                records: {
                  vitals: Array.isArray(cached.records.vitals) ? cached.records.vitals : [],
                  conditions: Array.isArray(cached.records.conditions)
                    ? cached.records.conditions
                    : [],
                  allergies: Array.isArray(cached.records.allergies)
                    ? cached.records.allergies
                    : [],
                  lastScan: cached.records.lastScan || {
                    title: '—',
                    facility: '—',
                    address: '—',
                    date: '—',
                  },
                  cholesterol: Array.isArray(cached.records.cholesterol)
                    ? cached.records.cholesterol
                    : [],
                  medications: Array.isArray(cached.records.medications)
                    ? cached.records.medications
                    : [],
                  observations: Array.isArray(cached.records.observations)
                    ? cached.records.observations
                    : [],
                  encounters: Array.isArray(cached.records.encounters)
                    ? cached.records.encounters
                    : [],
                },
              },
              lastIngestRawUri: cached.rawUri || synced.lastIngestRawUri,
              lastIngestAt: cached.fetchedAt || synced.lastIngestAt,
              healthExConnected: true,
              consentStatus: 'granted',
              consentGrantedAt: synced.consentGrantedAt || new Date().toISOString(),
            };
          } else if (clinical.profile && !('error' in clinical.profile)) {
            const { mapClinicalProfileToCache } = await import('@/lib/clinical-profile-mapper');
            const cache = mapClinicalProfileToCache({
              profile: clinical.profile as import('@/lib/patient-api').PatientClinicalProfile,
              referenceId: synced.healthExReferenceId || synced.id,
              source: 'database',
            });
            synced = {
              ...synced,
              clinicalCache: cache,
              healthExConnected: true,
              consentStatus: 'granted',
              consentGrantedAt: synced.consentGrantedAt || new Date().toISOString(),
            };
          } else if (synced.healthexConsentStatus === 'CONSENTED') {
            // HealthEx ready — dashboard hydrate will fetch clinical into UI.
            synced = {
              ...synced,
              healthExConnected: true,
            };
          }
        } catch {
          // Dashboard hydrate will retry DB load.
        }

        const loggedIn = { ...synced, isLoggedIn: true };
        saveAccount(loggedIn);
        replaceAccount(loggedIn);

        await establishPatientSession(loggedIn, {
          session,
          backendConfig,
          updateSession,
          resetSession,
        });
        sendWelcomeNotificationIfNeeded(loggedIn.id);
        const showWelcome = searchParams.get('welcome') === '1';
        router.replace(showWelcome ? '/profile/welcome' : '/dashboard');
        return;
      }

      const stored = loadAccount();
      if (!stored) {
        setError(
          'No account found. Use jane.doe@patient.demo / DemoPatient1! or register a new account.',
        );
        return;
      }

      if (!isRegistrationComplete(stored)) {
        setError('Finish email and phone verification before signing in.');
        return;
      }

      const success = login(values.email, values.password);
      if (!success) {
        setError(
          'Invalid email or password. Dev seed: jane.doe@patient.demo / DemoPatient1!',
        );
        return;
      }

      const loggedIn = loadAccount();
      if (!loggedIn) {
        setError('Unable to load account after sign-in.');
        return;
      }

      await establishPatientSession(loggedIn, {
        session,
        backendConfig,
        updateSession,
        resetSession,
      });

      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Try again.');
    } finally {
      setBusy(false);
    }
  }

  const stored = account ?? loadAccount();
  const registrationIncomplete = stored && !isRegistrationComplete(stored);
  const readySeed = seedAccounts.find((s) => s.readyToLogin);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {justRegistered && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
            Registration complete. Sign in with your email and password.
          </p>
        )}

        {readySeed && readySeed.password && (
          <div className="rounded-lg border border-primary/25 bg-accent px-3 py-2 text-sm text-accent-foreground">
            <p className="font-medium">Dev seed account</p>
            <p className="mt-1 font-mono text-xs">
              {readySeed.email} / {readySeed.password}
            </p>
            <button
              type="button"
              className="mt-2 font-medium underline"
              onClick={() => fillSeedAccount(readySeed)}
            >
              Fill credentials
            </button>
          </div>
        )}
        {(!readySeed || !readySeed.password) && (
          <div className="rounded-lg border border-primary/25 bg-accent px-3 py-2 text-sm text-accent-foreground">
            <p className="font-medium">Dev seed account</p>
            <p className="mt-1 font-mono text-xs">jane.doe@patient.demo / DemoPatient1!</p>
            <button
              type="button"
              className="mt-2 font-medium underline"
              onClick={() => {
                form.setValue('email', 'jane.doe@patient.demo');
                form.setValue('password', 'DemoPatient1!');
              }}
            >
              Fill credentials
            </button>
          </div>
        )}

        {registrationIncomplete && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Your registration is not finished.{' '}
            <Link href="/register" className="font-medium underline">
              Continue registration
            </Link>
          </p>
        )}

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    autoComplete="email"
                    className="h-11 pl-10"
                    disabled={busy || authLoading}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="h-11 pl-10 pr-10"
                    disabled={busy || authLoading}
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="h-11 w-full text-sm font-semibold"
          disabled={busy || authLoading}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Form>
  );
}
