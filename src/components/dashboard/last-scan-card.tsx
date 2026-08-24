import { ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LastScan } from '@/lib/types/health-records';

function isEmptyScan(scan: LastScan | null | undefined): boolean {
  if (!scan || typeof scan.title !== 'string') return true;
  return scan.title === '—' || !scan.title.trim();
}

export function LastScanCard({ scan }: { scan: LastScan | null | undefined }) {
  if (isEmptyScan(scan)) {
    return (
      <Card className="h-full border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Last Scan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
              <ScanLine className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">No imaging on file yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Refresh medical data after your HealthEx fetch completes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Last Scan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted">
            <ScanLine className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{scan.title}</p>
            <p className="text-sm text-muted-foreground">{scan.facility || '—'}</p>
            <p className="text-xs text-muted-foreground">{scan.address || '—'}</p>
            <p className="mt-1 text-xs text-muted-foreground">{scan.date || '—'}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm">
            View Scan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
