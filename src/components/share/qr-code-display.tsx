'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, ExternalLink, Loader2, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { sharePermissionLabel, type ActiveShare } from '@/lib/types/share';
import { buildShareViewUrl } from '@/lib/mock/share-store';
import { cn } from '@/lib/utils';

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Expired';
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function QrCodeDisplay({
  share,
  className,
}: {
  share: ActiveShare;
  className?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [remainingMs, setRemainingMs] = useState(
    () => Date.parse(share.expiresAt) - Date.now(),
  );

  const viewUrl = buildShareViewUrl(share.token);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    QRCode.toDataURL(viewUrl, {
      width: 280,
      margin: 2,
      color: { dark: '#0d9488', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [viewUrl]);

  useEffect(() => {
    const tick = () => setRemainingMs(Date.parse(share.expiresAt) - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [share.expiresAt]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(viewUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary" />
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="Provider share QR code"
            className="h-[240px] w-[240px]"
          />
        ) : (
          <div className="flex h-[240px] w-[240px] items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="success" className="gap-1">
          <QrCode className="h-3 w-3" />
          Active
        </Badge>
        <Badge variant="outline">{sharePermissionLabel(share.permission)}</Badge>
        <Badge variant={remainingMs < 60 * 60 * 1000 ? 'warning' : 'secondary'}>
          Expires in {formatRemaining(remainingMs)}
        </Badge>
      </div>

      <p className="max-w-sm text-center text-xs leading-relaxed text-muted-foreground">
        QR encodes a secure reference token only — no clinical data is embedded in the code.
      </p>

      <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" className="flex-1" onClick={copyLink}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        <Button type="button" variant="secondary" className="flex-1" asChild>
          <a href={viewUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
            Preview as provider
          </a>
        </Button>
      </div>
    </div>
  );
}
