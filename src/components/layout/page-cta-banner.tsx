"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageCtaBannerProps = {
  eyebrow?: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  imageSrc: string;
  imageAlt: string;
  tone?: "primary" | "navy" | "teal" | "slate";
  className?: string;
};

const toneStyles = {
  primary: {
    panel: "bg-brand-gradient-panel",
    eyebrow: "text-teal-100/90",
    description: "text-teal-50/85",
    secondary:
      "border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white",
    imageOverlay: "to-[#0f766e]/70",
  },
  navy: {
    panel: "bg-brand-gradient-panel",
    eyebrow: "text-teal-100/90",
    description: "text-teal-50/85",
    secondary:
      "border-white/35 bg-transparent text-white hover:bg-white/10 hover:text-white",
    imageOverlay: "to-[#0f766e]/70",
  },
  teal: {
    panel: "from-[#0f3d3a] via-[#0f4a45] to-[#0c3532] bg-gradient-to-br",
    eyebrow: "text-teal-200/90",
    description: "text-teal-50/85",
    secondary:
      "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
    imageOverlay: "to-[#0f3d3a]/60",
  },
  slate: {
    panel: "from-[#243447] via-[#1f2d3d] to-[#182433] bg-gradient-to-br",
    eyebrow: "text-slate-300",
    description: "text-slate-200/85",
    secondary:
      "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
    imageOverlay: "to-[#243447]/60",
  },
} as const;

export function PageCtaBanner({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  imageSrc,
  imageAlt,
  tone = "primary",
  className,
}: PageCtaBannerProps) {
  const styles = toneStyles[tone];

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-500",
        className,
      )}
    >
      <div className={cn("absolute inset-0", styles.panel)} />
      <div
        aria-hidden
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.2), transparent 42%), radial-gradient(circle at 82% 70%, rgba(255,255,255,0.1), transparent 45%)",
        }}
      />

      <div className="relative grid min-h-[220px] md:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
          {eyebrow && (
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-[0.14em]",
                styles.eyebrow,
              )}
            >
              {eyebrow}
            </p>
          )}
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-primary-foreground sm:text-3xl">
            {title}
          </h2>
          <p
            className={cn(
              "max-w-lg text-sm leading-relaxed sm:text-base",
              styles.description,
            )}
          >
            {description}
          </p>
          <div className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="lg"
              className="w-full bg-white text-primary hover:bg-white/90 sm:w-auto"
            >
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            {secondaryLabel && secondaryHref && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className={cn("w-full sm:w-auto", styles.secondary)}
              >
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="relative hidden min-h-[220px] md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-l from-transparent via-transparent",
              styles.imageOverlay,
            )}
          />
        </div>
      </div>
    </section>
  );
}
