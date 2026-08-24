'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePatientAccount } from '@/providers/patient-account-provider';
import { loadAccount } from '@/lib/mock/patient-account-store';
import { syncDevAccountToLocal, verifyDevPatientPhone } from '@/lib/patient-dev-accounts';
import { markWelcomeLetterAvailable } from '@/lib/welcome-letter';

const DEMO_OTP = '123456';

export function PhoneOtpForm() {
  const { account, confirmPhone } = usePatientAccount();
  const router = useRouter();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (value.length > 1) {
      const chars = value.replace(/\D/g, '').slice(0, 6).split('');
      const next = [...digits];
      chars.forEach((c, i) => {
        if (index + i < 6) next[index + i] = c;
      });
      setDigits(next);
      const focusIndex = Math.min(index + chars.length, 5);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = value.replace(/\D/g, '');
    setDigits(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  async function handleVerify() {
    const code = digits.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    setError('');

    if (account?.email) {
      const verified = await verifyDevPatientPhone(account.email);
      if (verified) {
        const stored = loadAccount();
        const password = stored?.passwordHash || '';
        syncDevAccountToLocal(verified, password);
        markWelcomeLetterAvailable(verified.id);
      } else {
        confirmPhone();
        markWelcomeLetterAvailable(account.id);
      }
    } else {
      confirmPhone();
    }

    router.push('/login?registered=1&welcome=1');
  }

  const maskedPhone = account?.phone
    ? account.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) ***-$3')
    : '';

  return (
    <div className="space-y-6">
      <Alert>
        <Smartphone className="h-4 w-4" />
        <AlertTitle>Enter verification code</AlertTitle>
        <AlertDescription>
          We sent a 6-digit code via SMS to <strong>{maskedPhone}</strong>.
        </AlertDescription>
      </Alert>

      <div className="flex justify-center gap-1 sm:gap-2">
        {digits.map((digit, i) => (
          <Input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="h-11 w-9 px-0 text-center text-lg font-semibold sm:h-12 sm:w-11"
          />
        ))}
      </div>

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      <p className="text-center text-xs text-muted-foreground">
        Demo code: <strong>{DEMO_OTP}</strong> (any 6 digits also work)
      </p>

      <Button onClick={handleVerify} className="w-full">
        Verify Phone
      </Button>
    </div>
  );
}
