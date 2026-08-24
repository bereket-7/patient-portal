'use client';

import Link from 'next/link';
import { Link2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ConnectHealthRecordsCta() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-white to-accent/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Link2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Connect My Health Records</CardTitle>
            <CardDescription>
              Link your HealthEx account to view health data and discover clinical trial matches.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            TrialClinIQ never stores your HealthEx credentials. HealthEx verifies your identity and
            controls access to your medical records.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/connect/healthex">Connect Health Records</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function DashboardEmptyPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[120px] items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-4">
      <p className="text-center text-sm text-muted-foreground">
        {title}
        <br />
        <span className="text-xs">Connect HealthEx to view</span>
      </p>
    </div>
  );
}
