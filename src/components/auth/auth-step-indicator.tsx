"use client";

import { REGISTRATION_STEPS } from "@/lib/patient-portal-nav";
import { cn } from "@/lib/utils";

export function RegistrationStepIndicator({
  currentStep,
}: {
  currentStep: number;
}) {
  const progress = (currentStep / REGISTRATION_STEPS.length) * 100;

  return (
    <div className="mb-8 w-full max-w-md">
      <div className="mb-3 flex justify-between gap-2 text-[11px] text-muted-foreground sm:text-xs">
        {REGISTRATION_STEPS.map((s) => (
          <span
            key={s.step}
            className={cn(
              "min-w-0 truncate text-center font-medium",
              s.step === currentStep && "text-primary",
              s.step < currentStep && "text-green-600",
            )}
          >
            <span className="sm:hidden">
              {s.step === 1 ? "Account" : s.step === 2 ? "Email" : "Phone"}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </span>
        ))}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Registration step {currentStep} of {REGISTRATION_STEPS.length}
      </p>
    </div>
  );
}

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1">
          <span className="text-2xl font-bold tracking-tight text-primary">
            Trial
          </span>
          <span className="text-2xl font-light tracking-tight text-muted-foreground">
            ClinIQ
          </span>
        </span>
        <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-primary/70">
          Patient Portal
        </p>
      </div>
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-6">{children}</div>
      {footer && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}
