'use client';

import Link from 'next/link';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AccessLogTable } from '@/components/privacy/access-log-table';

export default function AccessLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Data Access Log</h1>
        <p className="text-sm text-muted-foreground">
          Transparency into how your health information is used within TrialClinIQ.
        </p>
      </div>
      <AccessLogTable />
      <Card className="border-dashed">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <ShieldOff className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Want to stop sharing? You can revoke consent at any time.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/consent">Manage consent</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
