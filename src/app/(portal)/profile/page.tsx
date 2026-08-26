"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  CreditCard,
  FileText,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Share2,
  Shield,
  UserRound,
} from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { getConsentStatusLabel } from "@/lib/mock/consent-records";
import {
  countActiveConnectedApps,
  getConnectedApps,
} from "@/lib/mock/connected-apps";
import { getPatientProfileDetails } from "@/lib/mock/patient-profile";
import { formatDateTime } from "@/lib/format-date";
import { clearPatientSession } from "@/lib/patient-auth-bridge";
import { getDisplayName } from "@/lib/types/patient-account";
import { usePatientAccount } from "@/providers/patient-account-provider";
import { MemberIdProfileSummary } from "@/components/profile/member-id-profile-summary";

function Field({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value?: string | number | null;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={mono ? "font-mono text-sm font-medium" : "font-medium"}>
        {value === undefined || value === null || value === "" ? "—" : value}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const { account, logout, resetAccount } = usePatientAccount();
  const { resetSession } = useAuth();
  const router = useRouter();

  if (!account) return null;

  function handleSignOut() {
    logout();
    clearPatientSession({ resetSession });
    router.replace("/login");
  }

  function handleResetAccount() {
    resetAccount();
    clearPatientSession({ resetSession });
    router.replace("/register");
  }

  const profile = getPatientProfileDetails(account);
  const connectedApps = getConnectedApps(account);
  const activeApps = countActiveConnectedApps(connectedApps);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Your TrialClinIQ account, demographics, and HealthEx-linked identity
            details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/welcome">
              <FileText className="mr-2 h-4 w-4" />
              Welcome letter
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/profile/member-id">
              <CreditCard className="mr-2 h-4 w-4" />
              Member ID
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/consent">Consent & apps</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/privacy/access-log">Access log</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
              {account.firstName[0]}
              {account.lastName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xl">
                {getDisplayName(account)}
              </CardTitle>
              <CardDescription className="mt-1">
                Preferred name: {profile.preferredName}
                {profile.middleName ? ` · ${profile.middleName}` : ""} · Patient ID{" "}
                <span className="font-mono text-xs">{account.id}</span>
                {account.enterprisePatientId ? (
                  <>
                    {" "}
                    · Member ID{" "}
                    <span className="font-mono text-xs text-primary">
                      {account.enterprisePatientId}
                    </span>
                  </>
                ) : null}
              </CardDescription>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={account.emailVerified ? "success" : "outline"}>
                  Email {account.emailVerified ? "verified" : "unverified"}
                </Badge>
                <Badge
                  variant={account.healthExConnected ? "success" : "secondary"}
                >
                  HealthEx{" "}
                  {account.healthExConnected ? "connected" : "not connected"}
                </Badge>
                <Badge
                  variant={
                    account.consentStatus === "granted"
                      ? "success"
                      : account.consentStatus === "revoked"
                        ? "destructive"
                        : "outline"
                  }
                >
                  Consent: {getConsentStatusLabel(account.consentStatus)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <MemberIdProfileSummary />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Personal information</CardTitle>
            </div>
            <CardDescription>
              Identity details stored by TrialClinIQ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Legal first name" value={account.firstName} />
              <Field label="Legal last name" value={account.lastName} />
              <Field label="Middle name" value={profile.middleName} />
              <Field label="Preferred name" value={profile.preferredName} />
              <Field label="Date of birth" value={account.dateOfBirth} />
              <Field
                label="Age"
                value={profile.age !== null ? `${profile.age} years` : null}
              />
              <Field label="Sex at birth" value={profile.sexAtBirth} />
              <Field label="Gender identity" value={profile.genderIdentity} />
              <Field label="Marital status" value={profile.maritalStatus} />
              <Field
                label="Preferred language"
                value={profile.preferredLanguage}
              />
              <Field label="Race / ethnicity" value={profile.raceEthnicity} />
              <Field label="Blood type" value={profile.bloodType} />
              <Field
                label="Medical record number"
                value={profile.mrn}
                mono
                className="sm:col-span-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Contact information</CardTitle>
            </div>
            <CardDescription>
              How TrialClinIQ and sites may reach you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Primary email"
                value={account.email}
                className="sm:col-span-2"
              />
              <Field
                label="Secondary email"
                value={profile.emailSecondary}
                className="sm:col-span-2"
              />
              <Field label="Mobile phone" value={profile.phoneMobile} />
              <Field label="Home phone" value={profile.phoneHome} />
              <div className="sm:col-span-2 flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Verification status: email{" "}
                  <span className="font-medium text-foreground">
                    {account.emailVerified ? "verified" : "pending"}
                  </span>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Address</CardTitle>
            </div>
            <CardDescription>
              Residential address used for site proximity matching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Street address"
                value={profile.addressLine1}
                className="sm:col-span-2"
              />
              <Field
                label="Address line 2"
                value={profile.addressLine2}
                className="sm:col-span-2"
              />
              <Field label="City" value={profile.city} />
              <Field label="State / province" value={profile.state} />
              <Field label="Postal code" value={profile.postalCode} />
              <Field label="Country" value={profile.country} />
              <Field
                label="Time zone"
                value={profile.timezone}
                className="sm:col-span-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Emergency contact</CardTitle>
            </div>
            <CardDescription>
              Person to notify during screening or enrollment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={profile.emergencyContactName} />
              <Field
                label="Relationship"
                value={profile.emergencyContactRelation}
              />
              <Field
                label="Phone"
                value={profile.emergencyContactPhone}
                className="sm:col-span-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Care & insurance</CardTitle>
            </div>
            <CardDescription>
              Clinical context shared for matching and screening
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Primary care provider"
                value={profile.primaryCareProvider}
              />
              <Field
                label="Practice / organization"
                value={profile.primaryCareOrg}
              />
              <Field label="Insurance plan" value={profile.insurancePlan} />
              <Field
                label="Insurance member ID"
                value={profile.insuranceMemberId}
                mono
              />
              <Field
                label="TrialClinIQ Member ID"
                value={account.enterprisePatientId || 'Assigned after consent'}
                mono
                className="sm:col-span-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Preferences</CardTitle>
            </div>
            <CardDescription>
              How you want to be contacted about trials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                Communication channels
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.communicationPreferences.map((item) => (
                  <Badge key={item} variant="outline" className="font-normal">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                Notification topics
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.notificationPreferences.map((item) => (
                  <Badge key={item} variant="secondary" className="font-normal">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-primary/20 bg-brand-gradient-soft">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-button text-primary-foreground shadow-sm">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Share patient information
                </CardTitle>
                <CardDescription className="mt-1 max-w-xl">
                  Generate a QR code or secure link for a care provider. They
                  scan or open the link, then you give them a one-time OTP to
                  authorize access to your clinical summary.
                </CardDescription>
              </div>
            </div>
            <Button asChild>
              <Link href="/profile/share">Share with provider</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">
              HealthEx & research access
            </CardTitle>
          </div>
          <CardDescription>
            Connection and consent status for HealthEx data sharing (credentials
            are never stored).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="HealthEx connection"
              value={account.healthExConnected ? "Connected" : "Not connected"}
            />
            <Field
              label="Consent status"
              value={getConsentStatusLabel(account.consentStatus)}
            />
            <Field label="Connected apps (active)" value={String(activeApps)} />
            <Field
              label="Portal account ID"
              value={account.id}
              mono
              className="sm:col-span-2"
            />
            <Field
              label="TrialClinIQ Member ID"
              value={account.enterprisePatientId}
              mono
              className="sm:col-span-2"
            />
            <Field
              label="HealthEx patient ID"
              value={account.healthExPatientId}
              mono
            />
            <Field
              label="Consent reference"
              value={account.consentReferenceId}
              mono
              className="sm:col-span-2"
            />
            <Field
              label="Consent granted"
              value={
                account.consentGrantedAt
                  ? formatDateTime(account.consentGrantedAt)
                  : null
              }
            />
            <Field
              label="Consent revoked"
              value={
                account.consentRevokedAt
                  ? formatDateTime(account.consentRevokedAt)
                  : null
              }
            />
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/consent">Manage consent & connected apps</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/connect/healthex">
                {account.healthExConnected
                  ? "Refresh HealthEx"
                  : "Connect HealthEx"}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/privacy/access-log">View data access log</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/health/medications">View medications</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
        <Button variant="destructive" onClick={handleResetAccount}>
          Reset Demo Account
        </Button>
      </div>
    </div>
  );
}
