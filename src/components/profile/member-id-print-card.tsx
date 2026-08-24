'use client';

import { ShareQrCode } from '@/components/share/share-qr-code';
import { formatDateTime } from '@/lib/format-date';
import { getDisplayName } from '@/lib/types/patient-account';
import type { PatientAccount } from '@/lib/types/patient-account';
import { cn } from '@/lib/utils';

type MemberIdPrintCardProps = {
  account: PatientAccount;
  verifyUrl: string;
  loading?: boolean;
  className?: string;
};

/** On-screen / print member ID card — layout matches PNG export artwork. */
export function MemberIdPrintCard({
  account,
  verifyUrl,
  loading = false,
  className,
}: MemberIdPrintCardProps) {
  const memberId = account.enterprisePatientId!;
  const enrolledAt = account.consentGrantedAt || account.lastIngestAt;

  return (
    <article
      className={cn(
        'member-id-print-card mx-auto w-full max-w-[640px] overflow-hidden rounded-2xl border border-[#d1e3df] bg-white shadow-[0_18px_48px_-12px_rgba(15,118,110,0.22)] print:max-w-none print:shadow-none',
        className,
      )}
      aria-label="TrialClinIQ digital member ID card"
    >
      <header className="relative overflow-hidden bg-gradient-to-r from-[#115e59] via-[#0f766e] to-[#14b8a6] px-6 py-5 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_40%,rgba(255,255,255,0.08)_50%,transparent_60%)]" />
        <div className="relative flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            TrialClinIQ Member ID
          </h2>
          <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
            Research Member
          </span>
        </div>
      </header>

      <div className="relative bg-white px-6 py-6 sm:px-8 sm:py-7">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              'repeating-linear-gradient(112deg, transparent, transparent 26px, rgba(15,118,110,0.05) 26px, rgba(15,118,110,0.05) 27px)',
          }}
        />

        <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#115e59] to-[#14b8a6] text-lg font-semibold text-white shadow-sm">
                {account.firstName[0]}
                {account.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold tracking-tight text-[#111827] sm:text-2xl">
                  {getDisplayName(account)}
                </p>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Date of birth · {account.dateOfBirth}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#d1e3df] bg-[#f0fdfa] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                Member ID
              </p>
              <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-[#0f766e] sm:text-3xl">
                {memberId}
              </p>
            </div>

            {enrolledAt ? (
              <p className="text-sm text-[#6b7280]">
                Member since {formatDateTime(enrolledAt)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col items-center gap-2 rounded-xl border border-[#d1e3df] bg-white p-4 shadow-sm">
            {loading ? (
              <div className="h-[192px] w-[192px] animate-pulse rounded-lg bg-[#ecfdf5]" />
            ) : (
              <ShareQrCode value={verifyUrl} size={176} className="!p-1" />
            )}
            <p className="text-center text-xs font-medium text-[#6b7280]">
              Scan to verify membership
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#d1e3df] bg-[#ecfdf5] px-6 py-3 text-xs text-[#6b7280] sm:px-8">
        TrialClinIQ · Clinical research membership · No PHI encoded in QR
      </footer>
    </article>
  );
}
