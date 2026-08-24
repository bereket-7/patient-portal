'use client';

import QRCode from 'react-qr-code';
import { cn } from '@/lib/utils';

type ShareQrCodeProps = {
  value: string;
  size?: number;
  className?: string;
};

/** Client-side QR renderer — no external image API required. */
export function ShareQrCode({ value, size = 220, className }: ShareQrCodeProps) {
  if (!value) {
    return (
      <div
        className={cn(
          'flex aspect-square w-full min-w-0 items-center justify-center rounded-lg bg-muted/30 text-xs text-muted-foreground',
          className,
        )}
      >
        No link yet
      </div>
    );
  }

  return (
    <div
      className={cn(
        'aspect-square w-full min-w-0 overflow-hidden rounded-lg bg-white p-1.5 sm:p-2 [&>svg]:!h-auto [&>svg]:!w-full [&>svg]:!max-w-full [&>svg]:min-w-0',
        className,
      )}
    >
      <QRCode
        value={value}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#0f766e"
        style={{ width: '100%', height: 'auto' }}
        viewBox={`0 0 ${size} ${size}`}
      />
    </div>
  );
}
