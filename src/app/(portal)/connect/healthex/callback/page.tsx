"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePatientAccount } from "@/providers/patient-account-provider";
import {
  exchangeHealthExOAuthCode,
  mapDevAccountToPatientAccount,
} from "@/lib/patient-dev-accounts";
import { saveAccount } from "@/lib/mock/patient-account-store";
import { getHealthExCallbackUrl } from "@/lib/healthex-connect";
import {
  HEALTHEX_OAUTH_STATE_KEY,
  HEALTHEX_OAUTH_VERIFIER_KEY,
} from "@/lib/healthex-oauth-pkce";

export default function HealthExCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { account, replaceAccount } = usePatientAccount();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function completeOAuth() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const storedState = sessionStorage.getItem(HEALTHEX_OAUTH_STATE_KEY);
      const codeVerifier = sessionStorage.getItem(HEALTHEX_OAUTH_VERIFIER_KEY);

      if (!code || !state || state !== storedState || !codeVerifier) {
        setError("invalid_oauth_callback");
        return;
      }

      if (!account?.email) {
        setError("patient_not_logged_in");
        return;
      }

      sessionStorage.removeItem(HEALTHEX_OAUTH_STATE_KEY);
      sessionStorage.removeItem(HEALTHEX_OAUTH_VERIFIER_KEY);
      sessionStorage.removeItem("healthex_oauth_pkce_challenge");

      const result = await exchangeHealthExOAuthCode({
        email: account.email,
        code,
        codeVerifier,
        redirectUri: getHealthExCallbackUrl(),
      });

      if (!result.account) {
        setError(result.error || "oauth_exchange_failed");
        return;
      }

      const next = mapDevAccountToPatientAccount(
        result.account,
        account.passwordHash,
        {
          isLoggedIn: account.isLoggedIn,
          consentStatus: account.consentStatus,
          healthexSessionActive: true,
          healthExConnected: Boolean(result.account.healthExReferenceId),
          // Preserve existing HealthEx IDs from registration/sync — never overwrite with stubs.
          healthExReferenceId:
            account.healthExReferenceId || result.account.healthExReferenceId,
          healthExPatientId:
            account.healthExPatientId || result.account.healthExPatientId,
          consentReferenceId:
            account.consentReferenceId || result.account.consentReferenceId,
          healthexConsentStatus:
            account.healthexConsentStatus ||
            result.account.healthexConsentStatus,
          healthexRetrievalStatus:
            account.healthexRetrievalStatus ||
            result.account.healthexRetrievalStatus,
        },
      );
      saveAccount(next);
      replaceAccount(next);

      if (result.account.healthExReferenceId) {
        router.replace("/connect/healthex");
      } else {
        router.replace("/connect/healthex?oauth=connected");
      }
    }

    void completeOAuth();
  }, [account, router, searchParams]);

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-md">
        <AlertTitle>Connection failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <p className="text-sm text-muted-foreground">
        Completing HealthEx connection…
      </p>
    </div>
  );
}
