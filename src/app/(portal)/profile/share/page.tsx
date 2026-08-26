"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Copy,
  Link2,
  QrCode,
  RefreshCw,
  Shield,
  Share2,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@trialcliniq/shared-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShareQrCode } from "@/components/share/share-qr-code";
import { PermissionSelector } from "@/components/share/permission-selector";
import { useHealthRecords } from "@/lib/hooks/use-health-records";
import {
  createPatientShareSession,
  fetchShareAudit,
  getCurrentPatientShareSession,
  resolveShareUrl,
  revokePatientShareSession,
  type PatientShareSession,
  type ShareAuditEvent,
  type SharePermission,
} from "@/lib/patient-share-api";
import type { SharePermission as UiSharePermission } from "@/lib/types/share";
import { getDisplayName } from "@/lib/types/patient-account";
import { usePatientAccount } from "@/providers/patient-account-provider";

function formatCountdown(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")} remaining`;
}

export default function ProfileSharePage() {
  const { account } = usePatientAccount();
  const { session: authSession } = useAuth();
  const { records } = useHealthRecords();
  const [session, setSession] = useState<PatientShareSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [permission, setPermission] = useState<UiSharePermission>("ALL");
  const [auditEvents, setAuditEvents] = useState<ShareAuditEvent[]>([]);

  const loadAudit = useCallback(async () => {
    if (!authSession?.token || !account) return;
    const patientId =
      account.enterprisePatientId || account.id || authSession.sub || "";
    if (!patientId) return;
    const events = await fetchShareAudit(authSession, patientId);
    setAuditEvents(events);
  }, [account, authSession]);

  const loadSession = useCallback(async () => {
    if (!account?.email) return;
    const current = await getCurrentPatientShareSession(
      account.email,
      authSession,
      account.id,
    );
    if (current?.status === "active") {
      setSession(current);
      setShareUrl(resolveShareUrl(current));
      if (current.permission_scope) {
        setPermission(current.permission_scope as UiSharePermission);
      }
    } else {
      setSession(null);
      setShareUrl("");
    }
    await loadAudit();
  }, [account?.email, account?.id, authSession, loadAudit]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!session?.expires_at) return;
    const tick = () => setCountdown(formatCountdown(session.expires_at!));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session?.expires_at]);

  async function handleCreate() {
    if (!account?.email) return;
    setLoading(true);
    setCreateError(null);
    const { session: created, error } = await createPatientShareSession(
      {
        email: account.email,
        patient_id: account.id,
        account_id: account.id,
        first_name: account.firstName,
        last_name: account.lastName,
        date_of_birth: account.dateOfBirth,
        phone: account.phone,
        enterprise_patient_id: account.enterprisePatientId,
        health_ex_patient_id: account.healthExPatientId,
        consent_reference_id: account.consentReferenceId,
        permission: permission as SharePermission,
        conditions: records.conditions.map((c) => c.name),
        medications: records.medications.map((m) => m.name),
        allergies: records.allergies,
      },
      authSession,
    );
    setLoading(false);
    if (!created?.otp && !created?.token) {
      const message =
        error === "patient_share_disabled"
          ? "Share is disabled — set PATIENT_SHARE_ENABLED=true on patient-share-service."
          : error === "account_not_found"
            ? "Account not found on the server."
            : error === "network_error"
              ? "Cannot reach the API gateway."
              : error === "missing_bearer_token" || error === "http_401"
                ? "Sign in again — share requires an authenticated session."
                : "Could not create share session";
      setCreateError(message);
      toast.error(message);
      return;
    }
    setSession(created);
    setShareUrl(resolveShareUrl(created));
    await loadAudit();
    toast.success(
      "Share link ready — give the OTP to your provider after they scan.",
    );
  }

  async function handleRevoke() {
    if (!account?.email) return;
    await revokePatientShareSession(account.email, authSession, account.id);
    setSession(null);
    setShareUrl("");
    await loadAudit();
    toast.success("Share link revoked");
  }

  function copyLink() {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  }

  function copyOtp() {
    if (!session?.otp) return;
    void navigator.clipboard.writeText(session.otp);
    toast.success("OTP copied");
  }

  if (!account) return null;

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
        <Link href="/profile">
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
      </Button>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-primary/15 bg-brand-gradient-soft shadow-sm">
        <div className="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="min-w-0 space-y-5 bg-brand-gradient-panel p-4 text-primary-foreground sm:p-8 lg:p-10">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <Share2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-teal-100/90">
                  Secure share
                </p>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Share patient information
                </h1>
              </div>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-teal-50/85">
              Generate a time-limited link and one-time code for a care
              provider. They scan the QR code or open the link, then you
              verbally share the <strong>6-digit OTP</strong> to authorize
              access — nothing is shared without your approval.
            </p>

            <ol className="space-y-3 text-sm text-teal-50/80">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
                  1
                </span>
                Create a share link — valid for 15 minutes.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
                  2
                </span>
                Provider scans QR or opens the link on their device.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
                  3
                </span>
                Tell them the OTP shown below to unlock your summary.
              </li>
            </ol>

            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-teal-100/90">
                What to share
              </p>
              <PermissionSelector
                value={permission}
                onChange={setPermission}
                disabled={loading || Boolean(session?.token)}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {!session?.token ? (
                <Button
                  onClick={() => void handleCreate()}
                  disabled={loading}
                  className="w-full gap-2 bg-white text-primary hover:bg-white/90 sm:w-auto"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4" />
                  )}
                  Generate share link & OTP
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => void handleCreate()}
                    disabled={loading}
                    className="w-full gap-2 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4" />
                    New code
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => void handleRevoke()}
                    className="w-full bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                  >
                    Revoke access
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="min-w-0 border-t bg-card/80 p-4 sm:p-8 lg:border-l lg:border-t-0">
            {!session?.token ? (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 p-4 text-center sm:min-h-[320px] sm:p-8">
                {loading ? (
                  <>
                    <RefreshCw className="mb-4 h-12 w-12 animate-spin text-primary/60" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Generating share link and OTP…
                    </p>
                  </>
                ) : (
                  <>
                    <Smartphone className="mb-4 h-12 w-12 text-muted-foreground/40" />
                    <p className="max-w-xs text-sm font-medium text-muted-foreground">
                      QR code and OTP appear here after you generate a share
                      session.
                    </p>
                    {createError && (
                      <p className="mt-3 max-w-xs text-sm text-destructive">{createError}</p>
                    )}
                    <Button
                      onClick={() => void handleCreate()}
                      disabled={loading}
                      className="mt-6 w-full max-w-xs gap-2 bg-brand-gradient-button shadow-sm"
                    >
                      <QrCode className="h-4 w-4" />
                      Generate share link & OTP
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="min-w-0 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {countdown}
                  </Badge>
                  {session.verified && (
                    <Badge variant="success">Provider verified</Badge>
                  )}
                </div>

                <div className="mx-auto flex w-full min-w-0 max-w-[min(100%,16.5rem)] flex-col items-center gap-4">
                  <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-primary/15 bg-white p-2 shadow-sm ring-1 ring-primary/5 sm:p-3">
                    <ShareQrCode value={shareUrl} size={220} />
                  </div>
                  <p className="px-1 text-center text-xs text-muted-foreground">
                    Provider scans to open secure share page for{" "}
                    <span className="font-medium text-foreground">
                      {getDisplayName(account)}
                    </span>
                  </p>
                </div>

                {session.otp ? (
                  <Card className="min-w-0 border-primary/20 bg-primary/[0.04]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Your authorization code (OTP)
                      </CardTitle>
                      <CardDescription>
                        Read this number to the provider — shown once; do not
                        send by email or text.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                      <p className="min-w-0 break-all font-mono text-2xl font-bold tracking-[0.18em] text-primary sm:text-4xl sm:tracking-[0.35em]">
                        {session.otp}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyOtp}
                        className="w-full shrink-0 gap-1 sm:w-auto"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy OTP
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    OTP was shown when this link was created. Generate a new
                    code if the provider still needs it.
                  </p>
                )}

                <div className="min-w-0 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Share link
                  </p>
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1 overflow-hidden break-all rounded-lg border bg-muted/30 px-3 py-2 font-mono text-[11px] leading-relaxed sm:truncate sm:break-normal sm:text-xs sm:leading-normal">
                      {shareUrl}
                    </div>
                    <Button
                      variant="outline"
                      onClick={copyLink}
                      aria-label="Copy link"
                      className="w-full shrink-0 gap-1.5 sm:h-9 sm:w-9 sm:p-0"
                    >
                      <Link2 className="h-4 w-4" />
                      <span className="sm:hidden">Copy link</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {auditEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Share activity</CardTitle>
            <CardDescription>
              Durable audit trail (create, access, revoke) from patient-share-service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {auditEvents.slice(0, 8).map((event) => (
                <li
                  key={event.audit_id}
                  className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2 text-sm"
                >
                  <p className="font-medium capitalize">{event.action.toLowerCase()}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Privacy notice</AlertTitle>
        <AlertDescription>
          Shared data includes demographics and clinical summary scoped to what you selected.
          Access expires automatically. Revoke anytime to invalidate the link immediately.
        </AlertDescription>
      </Alert>
    </div>
  );
}
