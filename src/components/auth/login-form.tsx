"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "@trialcliniq/shared-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { usePatientAccount } from "@/providers/patient-account-provider";
import { loadAccount } from "@/lib/mock/patient-account-store";
import { isRegistrationComplete } from "@/lib/types/patient-account";
import { completeAuthenticatedLogin } from "@/lib/complete-authenticated-login";
import {
  fetchSeedPatientAccounts,
  syncDevAccountToLocal,
  type DevSeedAccount,
} from "@/lib/patient-dev-accounts";
import {
  loginPatientAccount,
  loginPatientAccountWithGoogle,
  PatientAccountsApiError,
  patientAccountsErrorMessage,
} from "@/lib/patient-accounts-api";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { account, replaceAccount } = usePatientAccount();
  const {
    session,
    backendConfig,
    loading: authLoading,
    updateSession,
    resetSession,
  } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [seedAccounts, setSeedAccounts] = useState<DevSeedAccount[]>([]);
  const justRegistered = searchParams.get("registered") === "1";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const stored = account ?? loadAccount();
    if (stored?.email) {
      form.setValue("email", stored.email);
    }
  }, [account, form]);

  useEffect(() => {
    fetchSeedPatientAccounts()
      .then(setSeedAccounts)
      .catch(() => setSeedAccounts([]));
  }, []);

  function fillSeedAccount(seed: DevSeedAccount) {
    form.setValue("email", seed.email);
    form.setValue("password", seed.password);
  }

  const authCtx = {
    session,
    backendConfig,
    updateSession,
    resetSession,
  };

  async function finishAuthenticated(
    apiAccount: Parameters<typeof completeAuthenticatedLogin>[0]["apiAccount"],
    accessToken: string | undefined,
    localPassword: string,
  ) {
    await completeAuthenticatedLogin({
      apiAccount,
      accessToken,
      localPassword,
      auth: authCtx,
      replaceAccount,
      showWelcome: searchParams.get("welcome") === "1",
      navigate: (href) => router.replace(href),
    });
  }

  async function onSubmit(values: FormValues) {
    setError("");
    setBusy(true);

    let navigated = false;
    try {
      const result = await loginPatientAccount(values.email, values.password);
      if (result.status === "mfa_required") {
        setError(
          "This account requires an extra verification step before sign-in.",
        );
        return;
      }

      const { account: apiAccount, accessToken } = result;
      if (!apiAccount.emailVerified) {
        setError("Verify your email before signing in.");
        syncDevAccountToLocal(apiAccount, values.password);
        return;
      }

      await finishAuthenticated(apiAccount, accessToken, values.password);
      navigated = true;
    } catch (err) {
      if (err instanceof PatientAccountsApiError) {
        setError(patientAccountsErrorMessage(err));
      } else {
        setError(
          err instanceof Error ? err.message : "Unable to sign in. Try again.",
        );
      }
    } finally {
      if (!navigated) {
        setBusy(false);
      }
    }
  }

  async function onGoogleCredential(idToken: string) {
    setError("");
    setBusy(true);
    let navigated = false;
    try {
      const result = await loginPatientAccountWithGoogle(idToken);
      if (result.status === "mfa_required") {
        setError(
          "This account requires an extra verification step before sign-in.",
        );
        return;
      }
      // Google-verified email — backend marks emailVerified; no portal email step.
      await finishAuthenticated(result.account, result.accessToken, "");
      navigated = true;
    } catch (err) {
      if (err instanceof PatientAccountsApiError) {
        // Backend maps bad Google tokens to invalid_credentials; keep Google-specific copy.
        if (err.code === 'invalid_credentials') {
          setError(
            'Google sign-in failed. Confirm Authorized JavaScript origins include this site (e.g. http://localhost:3102), both Client IDs match, and restart the API gateway.',
          );
        } else {
          setError(patientAccountsErrorMessage(err));
        }
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to sign in with Google. Try again.",
        );
      }
    } finally {
      if (!navigated) {
        setBusy(false);
      }
    }
  }

  const stored = account ?? loadAccount();
  const registrationIncomplete = stored && !isRegistrationComplete(stored);
  const readySeed = seedAccounts.find((s) => s.readyToLogin);

  return (
    <div className="space-y-4">
      {justRegistered && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-100">
          Registration complete. Sign in with your email and password, or
          continue with Google if that is the email you registered.
        </p>
      )}

      {readySeed && readySeed.password && (
        <div className="rounded-lg border border-primary/25 bg-accent px-3 py-2 text-sm text-accent-foreground">
          <p className="font-medium">Dev seed account</p>
          <p className="mt-1 font-mono text-xs">
            {readySeed.email} / {readySeed.password}
          </p>
          <button
            type="button"
            className="mt-2 font-medium underline disabled:opacity-50"
            disabled={busy || authLoading}
            onClick={() => fillSeedAccount(readySeed)}
          >
            Fill credentials
          </button>
        </div>
      )}
      {(!readySeed || !readySeed.password) && (
        <div className="rounded-lg border border-primary/25 bg-accent px-3 py-2 text-sm text-accent-foreground">
          <p className="font-medium">Dev seed account</p>
          <p className="mt-1 font-mono text-xs">
            jane.doe@patient.demo / DemoPatient1!
          </p>
          <button
            type="button"
            className="mt-2 font-medium underline disabled:opacity-50"
            disabled={busy || authLoading}
            onClick={() => {
              form.setValue("email", "jane.doe@patient.demo");
              form.setValue("password", "DemoPatient1!");
            }}
          >
            Fill credentials
          </button>
        </div>
      )}

      {registrationIncomplete && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          Your registration is not finished.{" "}
          <Link href="/register" className="font-medium underline">
            Continue registration
          </Link>
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      <GoogleSignInButton
        disabled={busy || authLoading}
        onCredential={onGoogleCredential}
        onError={setError}
      />

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-background px-3 text-muted-foreground">
            or sign in with email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      autoComplete="email"
                      className="h-11 bg-background pl-10 text-foreground"
                      disabled={busy || authLoading}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="h-11 bg-background pl-10 pr-10 text-foreground"
                      disabled={busy || authLoading}
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                      disabled={busy || authLoading}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="h-11 w-full gap-2 text-sm font-semibold"
            disabled={busy || authLoading}
          >
            {(busy || authLoading) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {busy || authLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
