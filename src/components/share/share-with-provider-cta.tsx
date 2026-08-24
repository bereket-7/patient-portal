'use client';

import Link from 'next/link';
import { QrCode, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ShareWithProviderCta() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-white via-white to-accent">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg sm:text-xl">Share with a provider</CardTitle>
            <CardDescription>
              Generate a time-limited QR code so your care team can view a clinical summary — no
              clipboard paperwork.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            The QR contains only a secure token. You choose what to share and can revoke access at
            any time.
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/share">Create share QR</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
