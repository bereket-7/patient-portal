"use client";

import { OnboardingGuard } from "@/components/layout/onboarding-guard";

export function RegistrationShell({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGuard mode="registration">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex flex-col items-center justify-center p-6 sm:p-10">
          {children}
        </div>
        <div
          className="relative hidden bg-cover bg-center lg:block"
          style={{ backgroundImage: "url(/images/medicalrecord.jpg)" }}
        >
          <div className="absolute inset-0 bg-brand-gradient-panel" />
          <div className="relative flex h-full flex-col justify-end p-10 text-white">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
              New patients
            </p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight">
              Create your account
              <br />
              and connect to research.
            </h2>
            <p className="mt-3 max-w-md text-white/80">
              Register once to verify your identity. After that, sign in anytime
              from the separate login page.
            </p>
          </div>
        </div>
      </div>
    </OnboardingGuard>
  );
}
