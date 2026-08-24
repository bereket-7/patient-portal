"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, RefreshCw, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  usePatientAccount,
  updateAccount,
} from "@/providers/patient-account-provider";
import {
  buildHealthExAuthorizeUrl,
  isHealthExOAuthConfigured,
  prepareHealthExOAuthState,
} from "@/lib/healthex-connect";
import {
  mapDevAccountToPatientAccount,
  retryHealthExLink,
  syncHealthExStatus,
} from "@/lib/patient-dev-accounts";
import {
  canAuthorizePlatformConsent,
  mergeHealthExSyncIntoAccount,
} from "@/lib/healthex-consent";

function consentBadgeClass(status?: string | null) {
  if (status === "CONSENTED")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "NOT_CONSENTED")
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground border-border";
}

export function HealthExConnect() {
  const { account, connectHealthEx, replaceAccount } = usePatientAccount();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const useOAuth = isHealthExOAuthConfigured();

  useEffect(() => {
    if (!account?.isLoggedIn) {
      router.replace("/login");
    }
  }, [account, router]);

  async function handleOAuthConnect() {
    if (!account) return;
    setRedirecting(true);
    setError(null);
    try {
      const state = await prepareHealthExOAuthState(account.id);
      const challenge =
        sessionStorage.getItem("healthex_oauth_pkce_challenge") || "";
      window.location.href = buildHealthExAuthorizeUrl(state, challenge);
    } catch {
      setRedirecting(false);
      setError("oauth_prepare_failed");
    }
  }

  async function handleRetryLink() {
    if (!account) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    const result = await retryHealthExLink(account.email);
    setBusy(false);
    if (!result.account) {
      setError(result.error || "Failed to link HealthEx patient");
      return;
    }
    const next = mapDevAccountToPatientAccount(
      result.account,
      account.passwordHash,
      {
        isLoggedIn: account.isLoggedIn,
        consentStatus: account.consentStatus,
        healthexSessionActive: account.healthexSessionActive,
      },
    );
    replaceAccount(next);
    if (result.linked) {
      setMessage("Linked to HealthEx project. Sync status to continue.");
    } else {
      setError(result.error || "HealthEx link failed");
    }
  }

  async function handleSync() {
    if (!account) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    const result = await syncHealthExStatus(account.email);
    setBusy(false);
    if (!result.account) {
      setError(result.error || "Sync failed");
      return;
    }
    const consentStatus =
      result.healthex?.consent_status || result.account.healthexConsentStatus;
    const retrievalStatus =
      result.healthex?.retrieval_status ||
      result.account.healthexRetrievalStatus;
    const base = mapDevAccountToPatientAccount(
      result.account,
      account.passwordHash,
      {
        isLoggedIn: account.isLoggedIn,
        consentStatus: account.consentStatus,
        healthexSessionActive: true,
        healthExConnected: consentStatus === "CONSENTED",
        consentReferenceId:
          result.healthex?.consent_reference_id ||
          result.account.consentReferenceId,
        clinicalCache: account.clinicalCache,
        backendConsentId: account.backendConsentId,
        consentGrantedAt: account.consentGrantedAt,
        lastIngestAt: account.lastIngestAt,
        lastIngestRawUri: account.lastIngestRawUri,
      },
    );
    const next = mergeHealthExSyncIntoAccount(base, {
      consentStatus,
      consentReferenceId:
        result.healthex?.consent_reference_id ||
        result.account.consentReferenceId,
    });
    replaceAccount(next);
    connectHealthEx();
    if (consentStatus === "CONSENTED") {
      setMessage(
        `Synced — consent CONSENTED${retrievalStatus ? `, retrieval ${retrievalStatus}` : ""}. You can continue to authorize TrialClinIQ.`,
      );
    } else if (consentStatus === "NOT_CONSENTED") {
      setMessage(
        "Sync succeeded — HealthEx still reports NOT_CONSENTED. Check your email for the HealthEx consent request, approve it, then sync again.",
      );
    } else {
      setMessage(
        `Synced — consent ${consentStatus || "unknown"}${retrievalStatus ? `, retrieval ${retrievalStatus}` : ""}.`,
      );
    }
  }

  function handleContinueToConsent() {
    if (!account) return;
    if (!canAuthorizePlatformConsent(account)) {
      setError(
        "Link to HealthEx and sync until CONSENTED before authorizing TrialClinIQ.",
      );
      return;
    }
    connectHealthEx();
    router.push("/connect/consent");
  }

  if (!account) return null;

  const hasLink = Boolean(account.healthExReferenceId);

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="mb-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-2xl font-bold text-white">
          HX
        </div>
        <h1 className="text-2xl font-semibold text-teal-800">
          Connect Health Records
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          HealthEx emails you after signup to grant research consent. Medical
          data stays blocked until that consent is approved and synced here.
        </p>
      </div>

      <Alert className="border-sky-200 bg-sky-50/80 text-sky-950">
        <AlertTitle className="text-sm">Consent workflow</AlertTitle>
        <AlertDescription className="mt-1 text-xs">
          <ol className="list-decimal space-y-1 pl-4">
            <li>
              Register — TrialClinIQ creates your HealthEx project patient.
            </li>
            <li>HealthEx sends a consent email to your inbox.</li>
            <li>Approve consent in the HealthEx wallet or patient portal.</li>
            <li>
              Return here and tap <strong>Sync from HealthEx</strong>.
            </li>
            <li>
              Only after status shows <strong>CONSENTED</strong> can you
              authorize TrialClinIQ.
            </li>
          </ol>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>HealthEx project link</CardTitle>
          <CardDescription>
            Registration creates a HealthEx project patient with your
            demographics. Sync reads live consent and retrieval status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 rounded border border-border bg-muted/20 p-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Reference ID</span>
              <span className="font-mono text-xs break-all">
                {account.healthExReferenceId || "—"}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Patient ID</span>
              <span className="font-mono text-xs break-all">
                {account.healthExPatientId || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Consent</span>
              <span
                className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${consentBadgeClass(account.healthexConsentStatus)}`}
              >
                {account.healthexConsentStatus || "unknown"}
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Retrieval</span>
              <span>{account.healthexRetrievalStatus || "—"}</span>
            </div>
          </div>

          {account.healthexLinkError && (
            <Alert variant="destructive">
              <AlertTitle>HealthEx link error</AlertTitle>
              <AlertDescription>{account.healthexLinkError}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {!hasLink ? (
            <Button
              onClick={handleRetryLink}
              disabled={busy}
              className="w-full gap-2"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              {busy ? "Linking…" : "Retry add to HealthEx"}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSync}
                disabled={busy}
                variant="outline"
                className="w-full gap-2"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {busy ? "Syncing…" : "Sync from HealthEx"}
              </Button>
              <Button
                onClick={handleContinueToConsent}
                disabled={busy || !canAuthorizePlatformConsent(account)}
                variant={
                  account.healthexConsentStatus === "CONSENTED"
                    ? "default"
                    : "outline"
                }
                className="w-full gap-2"
              >
                Continue to authorize TrialClinIQ
              </Button>
              {account.healthexConsentStatus === "NOT_CONSENTED" && (
                <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
                  <p className="font-medium">
                    Waiting for HealthEx email consent
                  </p>
                  <p>
                    Data connection is blocked until HealthEx confirms
                    CONSENTED. Patient ID and retrieval stay empty until you
                    approve consent from the email HealthEx sends.
                  </p>
                  <ol className="list-decimal space-y-1 pl-4">
                    <li>
                      Check your inbox for the HealthEx consent email (signup
                      address).
                    </li>
                    <li>
                      Open the link and grant research consent in HealthEx.
                    </li>
                    <li>
                      Return here and click <strong>Sync from HealthEx</strong>.
                    </li>
                  </ol>
                </div>
              )}
            </>
          )}

          {useOAuth && (
            <Button
              onClick={handleOAuthConnect}
              disabled={redirecting || busy}
              variant="outline"
              className="w-full gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {redirecting ? "Redirecting…" : "HealthEx Wallet OAuth"}
            </Button>
          )}
          {!useOAuth && (
            <p className="text-[11px] text-muted-foreground">
              Wallet OAuth is optional and disabled until{" "}
              <code className="rounded bg-muted px-1">NEXT_PUBLIC_HEALTHEX_AUTH_URL</code>{" "}
              and a HealthEx-issued OAuth client id are configured. The Sync flow above
              uses the server API key and does not need a portal client id.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
