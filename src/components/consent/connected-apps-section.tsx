"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Link2, Plus, ShieldCheck, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format-date";
import {
  authorizeConnectedApp,
  countActiveConnectedApps,
  getAvailableAppsToConnect,
  getConnectedApps,
  getConnectedAppStatusLabel,
  revokeConnectedApp,
  type ConnectedApp,
  type ConnectedAppStatus,
  type ConnectedAppTone,
} from "@/lib/mock/connected-apps";
import type { PatientAccount } from "@/lib/types/patient-account";
import { cn } from "@/lib/utils";

function statusVariant(
  status: ConnectedAppStatus,
): "success" | "destructive" | "warning" | "secondary" | "outline" {
  switch (status) {
    case "connected":
    case "authorized":
      return "success";
    case "pending":
      return "secondary";
    case "revoked":
      return "destructive";
    default:
      return "outline";
  }
}

const LOGO_TONES: Record<ConnectedAppTone, string> = {
  healthex: "bg-teal-700",
  trialcliniq: "bg-primary",
  site: "bg-sky-800",
  lab: "bg-indigo-800",
  pharmacy: "bg-cyan-800",
  care: "bg-slate-700",
};

function AppLogo({ app }: { app: ConnectedApp }) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-semibold text-white",
        LOGO_TONES[app.logoTone],
      )}
    >
      {app.logoInitials}
    </div>
  );
}

function AppCard({
  app,
  onAuthorize,
  onRevoke,
}: {
  app: ConnectedApp;
  onAuthorize: (id: string) => void;
  onRevoke: (id: string) => void;
}) {
  const active = app.status === "connected" || app.status === "authorized";
  const canToggle =
    !app.isCore &&
    (active || app.status === "pending" || app.status === "revoked");

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <AppLogo app={app} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold leading-snug">{app.name}</p>
            <Badge variant={statusVariant(app.status)}>
              {getConnectedAppStatusLabel(app.status)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {app.publisher} · {app.category}
          </p>
        </div>
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {app.description}
      </p>

      <div className="mt-3 space-y-2 text-xs">
        {app.purpose && (
          <p>
            <span className="text-muted-foreground">Purpose: </span>
            <span className="font-medium text-foreground">{app.purpose}</span>
          </p>
        )}
        {app.connectedAt && (
          <p>
            <span className="text-muted-foreground">Authorized: </span>
            {formatDateTime(app.connectedAt)}
          </p>
        )}
        {app.lastAccessedAt && active && (
          <p>
            <span className="text-muted-foreground">Last access: </span>
            {formatDateTime(app.lastAccessedAt)}
          </p>
        )}
        {app.patientId && (
          <p className="font-mono text-[11px] text-muted-foreground">
            ID: {app.patientId}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {app.scopes.slice(0, 4).map((scope) => (
          <Badge key={scope} variant="outline" className="font-normal">
            {scope}
          </Badge>
        ))}
        {app.scopes.length > 4 && (
          <Badge variant="secondary" className="font-normal">
            +{app.scopes.length - 4}
          </Badge>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {app.id === "healthex" &&
          (app.status === "disconnected" || app.status === "revoked") && (
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/connect/healthex">
                Reconnect HealthEx
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        {canToggle && active && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => onRevoke(app.id)}
          >
            <Unplug className="h-3.5 w-3.5" />
            Disconnect
          </Button>
        )}
        {canToggle &&
          (app.status === "pending" || app.status === "revoked") && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => onAuthorize(app.id)}
            >
              <Plus className="h-3.5 w-3.5" />
              Authorize
            </Button>
          )}
      </div>
    </div>
  );
}

export function ConnectedAppsSection({ account }: { account: PatientAccount }) {
  const [tick, setTick] = useState(0);

  const apps = useMemo(() => getConnectedApps(account), [account, tick]);
  const available = useMemo(
    () => getAvailableAppsToConnect(account),
    [account, tick],
  );
  const activeCount = countActiveConnectedApps(apps);
  const hasActiveHealthEx =
    account.healthExConnected && account.consentStatus === "granted";

  function refresh() {
    setTick((n) => n + 1);
  }

  function handleAuthorize(id: string) {
    authorizeConnectedApp(id);
    refresh();
    toast.success("App authorized", {
      description:
        "This app can now use HealthEx-authorized data under your research consent.",
    });
  }

  function handleRevoke(id: string) {
    revokeConnectedApp(id);
    refresh();
    toast.success("App disconnected", {
      description:
        "Access for this app has been revoked. You can authorize it again later.",
    });
  }

  const activeApps = apps.filter(
    (a) => a.status === "connected" || a.status === "authorized",
  );
  const otherApps = apps.filter(
    (a) => a.status !== "connected" && a.status !== "authorized",
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Connected apps</CardTitle>
            <CardDescription>
              Multiple applications can access your HealthEx data once you grant
              research consent. Manage each app individually below.
            </CardDescription>
          </div>
          {hasActiveHealthEx && (
            <Badge variant="success" className="gap-1">
              <Link2 className="h-3 w-3" />
              {activeCount} connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {apps.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No connected apps yet. Connect HealthEx and grant research consent
              to authorize data sharing with TrialClinIQ and partner apps.
            </p>
            <Button asChild className="mt-4 gap-2">
              <Link href="/connect/healthex">
                <ShieldCheck className="h-4 w-4" />
                Connect HealthEx
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {activeApps.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">
                  Active connections ({activeApps.length})
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {activeApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onAuthorize={handleAuthorize}
                      onRevoke={handleRevoke}
                    />
                  ))}
                </div>
              </div>
            )}

            {(otherApps.length > 0 || available.length > 0) &&
              hasActiveHealthEx && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">
                    Available & inactive ({otherApps.length + available.length})
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ...otherApps,
                      ...available.filter(
                        (a) => !otherApps.some((o) => o.id === a.id),
                      ),
                    ].map((app) => (
                      <AppCard
                        key={app.id}
                        app={app}
                        onAuthorize={handleAuthorize}
                        onRevoke={handleRevoke}
                      />
                    ))}
                  </div>
                </div>
              )}
          </>
        )}

        {hasActiveHealthEx && (
          <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4 text-sm text-muted-foreground">
            <p>
              HealthEx retrieves your records. You can authorize multiple
              partner apps (research sites, labs, pharmacy networks) under the
              same research consent. Disconnect any secondary app anytime;
              revoking TrialClinIQ consent suspends all HealthEx-based research
              access.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
