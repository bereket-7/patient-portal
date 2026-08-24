'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDateTime } from '@/lib/format-date';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  FHIR_RESOURCE_TYPES,
  getConsentHistory,
  getConsentStatusLabel,
  type ConsentHistoryEvent,
} from '@/lib/mock/consent-records';
import { ConnectedAppsSection } from '@/components/consent/connected-apps-section';
import { resolvePatientApiId, revokeBackendConsent } from '@/lib/patient-api';
import { usePatientAccount } from '@/providers/patient-account-provider';
import { useAuth } from '@trialcliniq/shared-ui';

function statusVariant(
  status: string,
): 'success' | 'destructive' | 'warning' | 'secondary' | 'outline' {
  switch (status) {
    case 'granted':
      return 'success';
    case 'revoked':
      return 'destructive';
    case 'denied':
      return 'warning';
    default:
      return 'outline';
  }
}

function HistoryIcon({ type }: { type: ConsentHistoryEvent['type'] }) {
  switch (type) {
    case 'granted':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'data_fetched':
      return <FileText className="h-4 w-4 text-primary" />;
    case 'revoked':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'denied':
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  }
}

export function ConsentManagementView() {
  const { account, revokeConsent } = usePatientAccount();
  const { session } = useAuth();
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);

  if (!account) return null;

  const history = getConsentHistory(account);
  const canRevoke = account.consentStatus === 'granted' && account.healthExConnected;
  const needsReauthorize =
    account.consentStatus === 'revoked' ||
    account.consentStatus === 'denied' ||
    account.consentStatus === 'none';

  async function handleRevoke() {
    setRevoking(true);
    try {
      if (account.backendConsentId && session.token) {
        const patientId = resolvePatientApiId(account, session);
        await revokeBackendConsent(session, account.backendConsentId, patientId);
      }
      revokeConsent();
      setRevokeOpen(false);
      toast.success('Consent revoked', {
        description: 'TrialClinIQ can no longer access your health records.',
      });
    } catch (err) {
      toast.error('Revocation failed', {
        description: err instanceof Error ? err.message : 'Unable to revoke consent.',
      });
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Consent & Privacy</h1>
        <p className="text-sm text-muted-foreground">
          Manage research authorization, HealthEx data access, and the apps connected to your health
          records.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Current Authorization</CardTitle>
              <CardDescription>Research purpose (RESRCH) consent via HealthEx</CardDescription>
            </div>
            <Badge variant={statusVariant(account.consentStatus)}>
              {getConsentStatusLabel(account.consentStatus)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Purpose of use</p>
              <p className="font-medium">RESRCH — Clinical trial matching</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">HealthEx connection</p>
              <p className="font-medium">{account.healthExConnected ? 'Connected' : 'Not connected'}</p>
            </div>
            {account.consentReferenceId && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Consent reference</p>
                <p className="font-mono text-xs">{account.consentReferenceId}</p>
              </div>
            )}
            {account.consentGrantedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Granted</p>
                <p className="text-sm">
                  {formatDateTime(account.consentGrantedAt)}
                </p>
              </div>
            )}
            {account.consentRevokedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Revoked</p>
                <p className="text-sm">
                  {formatDateTime(account.consentRevokedAt)}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium">What TrialClinIQ can access</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {FHIR_RESOURCE_TYPES.map((type) => (
                <li key={type} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {type}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              TrialClinIQ uses OAuth access tokens from HealthEx — never your HealthEx password.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {canRevoke && (
              <Button variant="destructive" onClick={() => setRevokeOpen(true)}>
                Revoke consent
              </Button>
            )}
            {needsReauthorize && (
              <Button asChild className="gap-2">
                <Link href="/connect/healthex">
                  <ShieldCheck className="h-4 w-4" />
                  {account.consentStatus === 'revoked' ? 'Re-authorize access' : 'Connect & authorize'}
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/privacy/access-log">View data access log</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {account.consentStatus === 'revoked' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access suspended</AlertTitle>
          <AlertDescription>
            Your health records are no longer available to TrialClinIQ. Trial matching and coordinator
            review are paused until you re-authorize.
          </AlertDescription>
        </Alert>
      )}

      <ConnectedAppsSection account={account} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consent history</CardTitle>
          <CardDescription>Timeline of authorization events for your account</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No consent events yet. Connect HealthEx to grant research authorization.
            </p>
          ) : (
            <ul className="space-y-4">
              {history.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <HistoryIcon type={event.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{event.label}</p>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke research consent?</DialogTitle>
            <DialogDescription>
              TrialClinIQ will immediately stop accessing your health records. Active trial matches may
              be paused and coordinators will no longer see your profile. You can re-authorize at any
              time.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setRevokeOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={revoking}>
              {revoking ? 'Revoking…' : 'Revoke consent'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
