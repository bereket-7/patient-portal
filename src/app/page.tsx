"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePatientAccount } from "@/providers/patient-account-provider";
import { isRegistrationComplete } from "@/lib/types/patient-account";
import {
  canAccessHealthData,
  needsHealthExEmailConsent,
} from "@/lib/healthex-consent";

export default function HomePage() {
  const { account, loading, resetAccount } = usePatientAccount();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (account?.isLoggedIn) {
      if (canAccessHealthData(account)) {
        router.replace("/dashboard");
      } else if (
        needsHealthExEmailConsent(account) ||
        account.healthExReferenceId
      ) {
        router.replace("/connect/healthex");
      } else {
        router.replace("/dashboard");
      }
      return;
    }

    if (account && isRegistrationComplete(account)) {
      router.replace("/login");
    }
  }, [account, loading, router]);

  if (
    loading ||
    account?.isLoggedIn ||
    (account && isRegistrationComplete(account))
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0f1f1a] px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(20,184,166,0.22), transparent 60%), linear-gradient(180deg, #0f1f1a 0%, #14261f 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/30">
          <HeartPulse className="h-7 w-7 text-primary" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Trial<span className="font-light text-slate-300">ClinIQ</span>
        </h1>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-primary">
          Patient Portal
        </p>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-slate-300">
          After registration, HealthEx emails you to grant research consent.
          TrialClinIQ only connects your medical data once that consent is
          approved.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Button size="lg" className="h-12 gap-2">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            type="button"
            onClick={() => {
              // If a previous registration exists in localStorage, the onboarding guard
              // may treat it as "already complete" and redirect back to /login.
              // Clearing here ensures the register flow works as expected.
              resetAccount();
              router.push("/register");
            }}
          >
            <UserPlus className="h-4 w-4" />
            Create account
          </Button>
        </div>

        <p className="mt-8 text-xs text-slate-500">
          Registration and sign-in are separate flows. New patients register
          first; returning patients sign in directly.
        </p>
      </div>
    </div>
  );
}
