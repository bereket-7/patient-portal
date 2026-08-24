"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  CreditCard,
  FileText,
  Globe,
  LogOut,
  Menu,
  ScrollText,
  Share2,
  Shield,
  UserRound,
} from "lucide-react";
import { useAuth } from "@trialcliniq/shared-ui";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HelpDialog } from "@/components/layout/help-dialog";
import { NotificationsPanel } from "@/components/layout/notifications-panel";
import {
  HEALTH_RECORD_NAV,
  PATIENT_PORTAL_NAV,
  PRIVACY_NAV,
} from "@/lib/patient-portal-nav";
import { clearPatientSession } from "@/lib/patient-auth-bridge";
import { getDisplayName } from "@/lib/types/patient-account";
import { cn } from "@/lib/utils";
import { usePatientAccount } from "@/providers/patient-account-provider";

function NavLinks({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className={className}>
      {PATIENT_PORTAL_NAV.map((item) => {
        const active =
          item.href === "/profile"
            ? pathname === "/profile"
            : pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white md:relative md:inline-block",
              active &&
                "text-white md:after:absolute md:after:bottom-0 md:after:left-3 md:after:right-3 md:after:h-0.5 md:after:bg-white",
            )}
          >
            {item.label}
          </Link>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "hidden items-center gap-1 px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white md:inline-flex",
              PRIVACY_NAV.some(
                (p) => pathname === p.href || pathname.startsWith(`${p.href}/`),
              ) && "text-white",
            )}
          >
            Privacy
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="normal-case tracking-normal text-muted-foreground">
            Privacy & access
          </DropdownMenuLabel>
          {PRIVACY_NAV.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} onClick={onNavigate}>
                {item.href === "/consent" ? (
                  <Shield className="h-4 w-4" />
                ) : (
                  <ScrollText className="h-4 w-4" />
                )}
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "hidden items-center gap-1 px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white md:inline-flex",
              HEALTH_RECORD_NAV.some(
                (h) => pathname === h.href || pathname.startsWith(`${h.href}/`),
              ) && "text-white",
            )}
          >
            Health Records
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="normal-case tracking-normal text-muted-foreground">
            Clinical data
          </DropdownMenuLabel>
          {HEALTH_RECORD_NAV.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href}>
                <FileText className="h-4 w-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}

export function PortalHeader() {
  const { account, logout } = usePatientAccount();
  const { resetSession } = useAuth();
  const router = useRouter();
  const initials = account
    ? `${account.firstName[0]}${account.lastName[0]}`.toUpperCase()
    : "PT";
  const allNavItems = [
    ...PATIENT_PORTAL_NAV,
    ...PRIVACY_NAV,
    ...HEALTH_RECORD_NAV,
  ];

  function handleSignOut() {
    logout();
    clearPatientSession({ resetSession });
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 bg-brand-gradient-header text-header-foreground shadow-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-0.5"
          >
            <span className="text-xl font-bold tracking-tight text-white">
              Trial
            </span>
            <span className="text-xl font-light tracking-tight text-white/70">
              ClinIQ
            </span>
          </Link>

          <NavLinks className="hidden items-center gap-1 md:flex" />
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white/80 hover:bg-white/10 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="normal-case tracking-normal text-muted-foreground">
                Menu
              </DropdownMenuLabel>
              {allNavItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/share">
                  <Share2 className="h-4 w-4" />
                  Share with provider
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NotificationsPanel />
          <Button
            asChild
            size="sm"
            className="gap-1.5 bg-white text-primary shadow-sm hover:bg-white/90"
          >
            <Link href="/profile/share">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden gap-1 text-white/80 hover:bg-white/10 hover:text-white sm:flex"
          >
            <Globe className="h-4 w-4" />
            EN
            <ChevronDown className="h-3 w-3" />
          </Button>
          <HelpDialog />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="gap-2 text-white/90 hover:bg-white/10 hover:text-white"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-white/20 text-xs text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm sm:inline">
                  {account ? getDisplayName(account) : "Patient"}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-0">
              <div className="border-b border-border/60 bg-gradient-to-br from-primary/5 to-accent/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/15">
                    <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {account ? getDisplayName(account) : "Patient"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {account?.email || "Signed in"}
                    </p>
                    {account?.enterprisePatientId ? (
                      <p className="truncate font-mono text-[11px] text-primary">
                        Member ID {account.enterprisePatientId}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                <DropdownMenuItem asChild>
                  <Link href="/profile/share">
                    <Share2 className="h-4 w-4" />
                    Share with provider
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/member-id">
                    <CreditCard className="h-4 w-4" />
                    Digital Member ID
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserRound className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/consent">
                    <Shield className="h-4 w-4" />
                    Consent & Privacy
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/privacy/access-log">
                    <ScrollText className="h-4 w-4" />
                    Data Access Log
                  </Link>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="mx-0" />
              <div className="p-1.5">
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive focus:[&>svg]:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
