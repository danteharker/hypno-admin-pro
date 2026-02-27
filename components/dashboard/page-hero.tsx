"use client";

import Link from "next/link";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/motion/animated-section";

export type PageHeroAccent = "emerald" | "amber" | "rose" | "teal" | "indigo";

const accentConfig: Record<
  PageHeroAccent,
  {
    orb: string;
    iconBg: string;
    iconColor: string;
    iconGlow: string;
  }
> = {
  emerald: {
    orb: "bg-primary/25",
    iconBg: "bg-primary/12",
    iconColor: "text-primary",
    iconGlow: "icon-glow-emerald",
  },
  amber: {
    orb: "bg-accent-amber/20",
    iconBg: "bg-accent-amber/12",
    iconColor: "text-accent-amber",
    iconGlow: "icon-glow-amber",
  },
  rose: {
    orb: "bg-accent-rose/20",
    iconBg: "bg-accent-rose/12",
    iconColor: "text-accent-rose",
    iconGlow: "icon-glow-rose",
  },
  teal: {
    orb: "bg-accent-teal/20",
    iconBg: "bg-accent-teal/12",
    iconColor: "text-accent-teal",
    iconGlow: "icon-glow-teal",
  },
  indigo: {
    orb: "bg-indigo-500/20",
    iconBg: "bg-indigo-500/12",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconGlow: "shadow-[0_0_20px_-2px_rgba(99,102,241,0.35)]",
  },
};

export function PageHero({
  icon: Icon,
  title,
  description,
  accentColor = "emerald",
  backHref,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor?: PageHeroAccent;
  backHref?: string;
  children?: React.ReactNode;
}) {
  const config = accentConfig[accentColor];

  return (
    <AnimatedSection>
      <section className="relative rounded-3xl p-6 md:p-10 bg-muted/50 border border-border/30">
        <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-mesh" />
          <div
            className={`absolute -top-1/2 -right-1/4 w-[320px] h-[320px] rounded-full blur-[80px] animate-float-slow ${config.orb}`}
          />
          <div
            className={`absolute -bottom-1/3 -left-1/4 w-[240px] h-[240px] rounded-full blur-[60px] animate-float-slower opacity-80 ${config.orb}`}
          />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            {backHref && (
              <Link href={backHref}>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${config.iconBg} ${config.iconColor} ${config.iconGlow}`}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-1.5 text-sm md:text-base text-muted-foreground font-light max-w-xl">
                {description}
              </p>
            </div>
          </div>
          {children && (
            <div className="flex flex-wrap gap-3 shrink-0">{children}</div>
          )}
        </div>
      </section>
    </AnimatedSection>
  );
}
