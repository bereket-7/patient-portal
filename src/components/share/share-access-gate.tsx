'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { Check, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const OTP_LENGTH = 6;
/** Demo verification code for the share-access flow. */
export const SHARE_DEMO_OTP = '123456';

type GatePhase = 'otp' | 'verifying' | 'success';

/** In-memory only — cleared on full page refresh, kept for client navigations. */
const verifiedTokens = new Set<string>();

export function isShareVerified(token: string): boolean {
  return Boolean(token) && verifiedTokens.has(token);
}

function markShareVerified(token: string) {
  if (token) verifiedTokens.add(token);
}

function OtpInputs({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focusAt = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))];
    el?.focus();
    el?.select();
  };

  const setDigit = (index: number, digit: string) => {
    if (!/^\d?$/.test(digit)) return;
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < OTP_LENGTH - 1) focusAt(index + 1);
  };

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[index]) {
        const next = [...value];
        next[index] = '';
        onChange(next);
      } else if (index > 0) {
        const next = [...value];
        next[index - 1] = '';
        onChange(next);
        focusAt(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => pasted[i] ?? '');
    onChange(next);
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div
      className={cn('flex justify-center gap-2', error && 'animate-otp-shake')}
      role="group"
      aria-label="One-time passcode"
    >
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={digit}
          onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-12 w-10 rounded-sm border bg-background text-center text-lg font-semibold tabular-nums outline-none transition-colors duration-150 sm:h-13 sm:w-11',
            'focus:border-primary focus:ring-1 focus:ring-primary/30',
            digit ? 'border-primary text-foreground' : 'border-border text-foreground',
            error && 'border-destructive text-destructive',
            disabled && 'opacity-55',
          )}
        />
      ))}
    </div>
  );
}

export function ShareAccessGate({
  token,
  onVerified,
}: {
  token: string;
  onVerified: () => void;
}) {
  const [phase, setPhase] = useState<GatePhase>('otp');
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const code = digits.join('');

  const finish = useCallback(() => {
    markShareVerified(token);
    onVerified();
  }, [onVerified, token]);

  const verify = useCallback(() => {
    if (code.length !== OTP_LENGTH) return;
    setError(null);

    if (code !== SHARE_DEMO_OTP) {
      setError('That code doesn’t match. Try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      return;
    }

    setPhase('verifying');
    window.setTimeout(() => setPhase('success'), 750);
  }, [code]);

  useEffect(() => {
    if (code.length === OTP_LENGTH && phase === 'otp' && !error) {
      const t = window.setTimeout(verify, 160);
      return () => window.clearTimeout(t);
    }
  }, [code, error, phase, verify]);

  useEffect(() => {
    if (phase !== 'success') return;
    const t = window.setTimeout(finish, 1400);
    return () => window.clearTimeout(t);
  }, [finish, phase]);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#0f1f1a]/50 animate-gate-fade-in" />

      <div className="relative w-full max-w-md animate-gate-pop-in">
        <div className="overflow-hidden rounded-sm border border-border bg-card shadow-lg">
          <div className="h-1 bg-primary" />

          {phase === 'otp' || phase === 'verifying' ? (
            <div className="space-y-6 px-6 py-8 sm:px-8">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                  {phase === 'verifying' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                    Secure access
                  </p>
                  <h2 className="font-[family-name:var(--font-chart-display)] text-2xl font-semibold tracking-tight">
                    {phase === 'verifying' ? 'Verifying code' : 'Enter verification code'}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {phase === 'verifying'
                      ? 'Confirming the patient share code…'
                      : 'Ask the patient for their 6-digit code to open this chart.'}
                  </p>
                </div>
              </div>

              <OtpInputs
                value={digits}
                onChange={(next) => {
                  setError(null);
                  setDigits(next);
                }}
                disabled={phase === 'verifying'}
                error={Boolean(error)}
              />

              {error && (
                <p className="text-center text-sm font-medium text-destructive animate-gate-fade-in">
                  {error}
                </p>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={code.length !== OTP_LENGTH || phase === 'verifying'}
                  onClick={verify}
                  className="inline-flex h-11 w-full items-center justify-center rounded-sm bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {phase === 'verifying' ? 'Verifying…' : 'Continue'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 px-6 py-12 text-center sm:px-8 animate-gate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-primary text-primary-foreground animate-success-check">
                <Check className="h-7 w-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-[family-name:var(--font-chart-display)] text-2xl font-semibold tracking-tight">
                  Access granted
                </h2>
                <p className="text-sm text-muted-foreground">Opening shared patient chart…</p>
              </div>
              <div className="mt-1 h-0.5 w-24 overflow-hidden rounded-sm bg-muted">
                <div className="h-full w-full origin-left animate-gate-progress bg-primary" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
