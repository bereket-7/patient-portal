'use client';

import { AlertTriangle, Clock3, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sharePermissionLabel, type ActiveShare, type ShareAuditEvent } from '@/lib/types/share';

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ActiveSharePanel({
  share,
  audit,
  onRevoke,
  revoking,
}: {
  share: ActiveShare;
  audit: ShareAuditEvent[];
  onRevoke: () => void;
  revoking?: boolean;
}) {
  const recent = audit.slice(0, 4);

  return (
    <div className="space-y-4">
      <Card className="border-primary/15 bg-gradient-to-br from-white to-accent/25">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Active share session</CardTitle>
              <CardDescription>
                Providers can scan your QR until you revoke it or it expires.
              </CardDescription>
            </div>
            <Badge variant="success" className="shrink-0">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-md bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">Scope</p>
              <p className="font-medium">{sharePermissionLabel(share.permission)}</p>
            </div>
            <div className="rounded-md bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="font-medium">{formatWhen(share.createdAt)}</p>
            </div>
            <div className="rounded-md bg-muted/40 px-3 py-2 sm:col-span-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                Expires
              </p>
              <p className="font-medium">{formatWhen(share.expiresAt)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Revoking immediately blocks new provider access for this QR. Anyone who already opened
              the summary keeps their current browser view only.
            </p>
          </div>

          <Button type="button" variant="destructive" onClick={onRevoke} disabled={revoking}>
            Revoke share access
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Share activity
          </CardTitle>
          <CardDescription>Local demo audit trail for create, access, and revoke events.</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No share events yet.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium capitalize">{event.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {sharePermissionLabel(event.permission)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatWhen(event.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
