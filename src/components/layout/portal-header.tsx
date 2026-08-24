"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  LogOut,
  Menu,
  Monitor,
  Moon,
  ScrollText,
  Share2,
  Shield,
  Sun,
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
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTheme } from "@/components/theme/theme-provider";
import type { ThemePreference } from "@/lib/theme";
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

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function PortalHeader() {
  const { account, logout } = usePatientAccount();
  const { resetSession } = useAuth();
  const { preference, setPreference } = useTheme();
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
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
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-3 md:gap-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[min(16rem,calc(100vw-1.5rem))]">
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
              <DropdownMenuItem onSelect={() => setHelpOpen(true)}>
                <HelpCircle className="h-4 w-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="normal-case tracking-normal text-muted-foreground">
                Appearance
              </DropdownMenuLabel>
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = preference === option.value;
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={() => setPreference(option.value)}
                    className={selected ? "font-semibold" : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{option.label}</span>
                    {selected ? <Check className="h-4 w-4 text-primary" /> : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/dashboard"
            className="flex min-w-0 shrink items-center gap-0.5"
          >
            <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
              Trial
            </span>
            <span className="text-lg font-light tracking-tight text-white/70 sm:text-xl">
              ClinIQ
            </span>
          </Link>

          <NavLinks className="hidden min-w-0 items-center gap-1 md:flex" />
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <ThemeToggle className="hidden sm:inline-flex" />
          <NotificationsPanel />
          <Button
            asChild
            size="sm"
            className="h-9 w-9 gap-1.5 bg-white p-0 text-primary shadow-sm hover:bg-white/90 sm:h-9 sm:w-auto sm:px-3"
          >
            <Link href="/profile/share" aria-label="Share with provider">
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
          <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white/90 hover:bg-white/10 hover:text-white sm:h-9 sm:w-auto sm:gap-2 sm:px-3"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-white/20 text-xs text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm lg:inline">
                  {account ? getDisplayName(account) : "Patient"}
                </span>
                <ChevronDown className="hidden h-3 w-3 sm:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(16rem,calc(100vw-1.5rem))] p-0">
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
