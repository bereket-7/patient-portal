"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  Loader2,
  Lock,
  Pill,
  Shield,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchShareSessionPublic,
  verifyShareOtp,
  type SharedPatientPayload,
} from "@/lib/patient-share-api";

export default function ProviderSharePage() {
  const params = useParams();
  const token = params.token as string;
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [initials, setInitials] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<SharedPatientPayload | null>(null);

  useEffect(() => {
    void (async () => {
      const info = await fetchShareSessionPublic(token);
      setLoading(false);
      if (!info) {
        setError("share_not_found");
        return;
      }
      if (info.expired || !info.valid) {
        setExpired(true);
        return;
      }
      setInitials(info.patient_initials || "PT");
    })();
  }, [token]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    const result = await verifyShareOtp(token, otp);
    setVerifying(false);
    if (result.ok === false) {
      setError(result.error);
      return;
    }
    setPatient(result.patient);
  }

  return (
    <div className="min-h-screen bg-brand-gradient-soft">
      <header className="border-b bg-brand-gradient-header text-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-2 px-4">
          <span className="min-w-0 truncate text-lg font-semibold tracking-tight">
            Trial<span className="font-light text-white/70">ClinIQ</span>
          </span>
          <Badge variant="outline" className="shrink-0 gap-1 border-white/30 bg-white/10 text-white">
            <Shield className="h-3 w-3" />
            <span className="sm:hidden">Provider</span>
            <span className="hidden sm:inline">Provider access</span>
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-10">
        {loading && (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading secure share…</p>
          </div>
        )}

        {!loading && expired && (
          <Card className="text-center">
            <CardContent className="py-12">
              <p className="font-medium">This share link has expired.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask the patient to generate a new QR code from their profile.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && error === "share_not_found" && (
          <Card className="text-center">
            <CardContent className="py-12">
              <p className="font-medium">Share link not found.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The link may have been revoked or is invalid.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && !expired && !patient && error !== "share_not_found" && (
          <Card className="overflow-hidden shadow-lg">
            <div className="bg-brand-gradient-panel px-6 py-8 text-center text-primary-foreground">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-semibold">
                {initials || "—"}
              </div>
              <h1 className="text-xl font-semibold">
                Patient information request
              </h1>
              <p className="mt-2 text-sm text-primary-foreground/85">
                Ask the patient for their 6-digit authorization code to view
                their shared summary.
              </p>
            </div>
            <CardContent className="p-6">
              <form
                onSubmit={(e) => void handleVerify(e)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="otp">Authorization code (OTP)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="pl-10 font-mono text-lg tracking-[0.2em] sm:tracking-[0.3em]"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The patient sees this code on their phone after generating a
                    share link.
                  </p>
                </div>
                {error && error !== "share_not_found" && (
                  <p className="text-sm text-destructive">
                    {error === "invalid_otp"
                      ? "Incorrect code. Ask the patient to confirm the OTP."
                      : error === "too_many_attempts"
                        ? "Too many attempts. Request a new share link from the patient."
                        : error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={otp.length !== 6 || verifying}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify & view summary"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {patient && (
          <div className="space-y-4">
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="flex items-center gap-3 py-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-900">
                  Access authorized by patient OTP
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserRound className="h-5 w-5 text-primary" />
                  {patient.display_name}
                </CardTitle>
                <CardDescription>
                  Shared clinical summary · updated{" "}
                  {new Date(patient.last_updated).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Date of birth</p>
                  <p className="font-medium">{patient.date_of_birth || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email_masked}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{patient.phone_masked || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Enterprise ID</p>
                  <p className="font-mono text-xs">
                    {patient.enterprise_patient_id || "—"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <HeartPulse className="h-4 w-4 text-primary" />
                  Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.conditions.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {patient.conditions.map((c) => (
                      <Badge key={c} variant="outline">
                        {c}
                      </Badge>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    None documented
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Pill className="h-4 w-4 text-primary" />
                  Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medications.length ? (
                  <ul className="space-y-1 text-sm">
                    {patient.medications.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    None documented
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.allergies.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {patient.allergies.map((a) => (
                      <Badge key={a} variant="destructive">
                        {a}
                      </Badge>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    None documented
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
