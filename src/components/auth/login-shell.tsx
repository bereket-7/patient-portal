"use client";

import Link from "next/link";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { OnboardingGuard } from "@/components/layout/onboarding-guard";

export function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGuard mode="login">
      <div className="relative flex min-h-screen overflow-hidden bg-[#0f1f1a]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 15% 20%, rgba(20,184,166,0.28), transparent 55%), radial-gradient(ellipse 60% 50% at 85% 80%, rgba(34,197,94,0.15), transparent 50%), linear-gradient(160deg, #0f1f1a 0%, #14261f 45%, #0f1f1a 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col lg:flex-row lg:items-stretch">
          <aside className="flex flex-1 flex-col justify-between px-8 py-10 text-white lg:px-14 lg:py-16">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
                  <HeartPulse className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight">
                    Trial
                    <span className="font-light text-slate-300">ClinIQ</span>
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Patient Portal
                  </p>
                </div>
              </div>

              <h1 className="mt-14 max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Welcome back
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
                Sign in to view your health summary, manage consent, and explore
                clinical trial matches matched to your profile.
              </p>

              <ul className="mt-10 space-y-4 text-sm text-slate-300">
                {[
                  "Secure access to your connected health records",
                  "Control what data is shared for research",
                  "Review trial matches on your terms",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <ShieldCheck className="h-3 w-3" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-12 hidden text-xs text-slate-500 lg:block">
              New to TrialClinIQ?{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:text-primary/80"
              >
                Create an account
              </Link>{" "}
              — registration is separate from sign-in.
            </p>
          </aside>

          <section className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-10 lg:py-16">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl shadow-black/40 backdrop-blur">
              {children}
            </div>
          </section>
        </div>
      </div>
    </OnboardingGuard>
  );
}
