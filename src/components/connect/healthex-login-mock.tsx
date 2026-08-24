"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePatientAccount } from "@/providers/patient-account-provider";

type HealthExLoginMockProps = {
  onSignIn?: () => void;
};

export function HealthExLoginMock({ onSignIn }: HealthExLoginMockProps) {
  const { connectHealthEx } = usePatientAccount();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    connectHealthEx();
    if (onSignIn) {
      onSignIn();
    } else {
      router.push("/connect/consent");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-2xl font-bold text-white">
          HX
        </div>
        <h1 className="text-2xl font-semibold text-teal-800">HealthEx</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Secure Patient Identity Provider
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign in to HealthEx</CardTitle>
          <CardDescription>
            Authenticate with your existing HealthEx or provider portal
            credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              TrialClinIQ does not collect or store these credentials. You are
              signing in directly with HealthEx.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hx-username">Username or Email</Label>
              <Input
                id="hx-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="patient@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hx-password">Password</Label>
              <Input
                id="hx-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Sign in with HealthEx
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
