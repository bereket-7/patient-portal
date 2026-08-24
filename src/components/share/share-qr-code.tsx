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
          'flex items-center justify-center rounded-lg bg-muted/30 text-xs text-muted-foreground',
          className,
        )}
        style={{ width: size, height: size }}
      >
        No link yet
      </div>
    );
  }

  return (
    <div
      className={cn('rounded-lg bg-white p-2', className)}
      style={{ width: size + 16, height: size + 16 }}
    >
      <QRCode
        value={value}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#0f766e"
        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
        viewBox={`0 0 ${size} ${size}`}
      />
    </div>
  );
}
