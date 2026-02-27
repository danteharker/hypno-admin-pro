"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Mic,
  Users,
  Presentation,
  ListChecks,
  Library,
  Wrench,
  Rss,
  Sparkles,
  MessageCircle,
  Plus,
  Play,
  ArrowRight,
} from "lucide-react";
import { AnimatedSection } from "@/components/motion/animated-section";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-children";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const greeting = getGreeting();

  return (
    <div className="space-y-10">
      {/* ── Welcome Hero ── */}
      <AnimatedSection>
        <section className="relative rounded-3xl p-8 md:p-12 bg-muted/50 border border-border/30">
          <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-mesh" />
            <div className="absolute -top-1/2 -right-1/4 w-[400px] h-[400px] rounded-full bg-primary/25 blur-[100px] animate-float-slow" />
            <div className="absolute -bottom-1/3 -left-1/4 w-[300px] h-[300px] rounded-full bg-accent-teal/20 blur-[80px] animate-float-slower" />
            <div className="absolute top-1/4 right-1/3 w-[200px] h-[200px] rounded-full bg-accent-amber/15 blur-[60px] animate-float-slow" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
              {greeting}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight leading-[1.2]">
              Your creative{" "}
              <span className="text-gradient italic inline-block py-6 -my-6 px-3 -mx-3">workspace</span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground font-light max-w-xl">
              Jump in with a quick action or explore your tools below.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl gap-2 h-12 px-6 btn-shimmer">
                <Link href="/dashboard/scripts/new">
                  <Plus className="h-5 w-5" />
                  New Script
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-xl gap-2 h-12 px-6 bg-background/60 backdrop-blur-sm"
              >
                <Link href="/dashboard/session">
                  <Play className="h-5 w-5" />
                  Start Session
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Your Workflow — gradient cards ── */}
      <AnimatedSection delay={0.05}>
        <section>
          <h2 className="font-serif text-xl font-medium tracking-tight text-foreground mb-5">
            Your Workflow
          </h2>
          <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {([
              {
                title: "Scripts",
                href: "/dashboard/scripts",
                icon: FileText,
                desc: "Write, edit & generate hypnotherapy scripts.",
                gradient: "card-gradient-emerald",
              },
              {
                title: "Clients",
                href: "/dashboard/clients",
                icon: Users,
                desc: "Manage client profiles and session history.",
                gradient: "card-gradient-amber",
              },
              {
                title: "Session",
                href: "/dashboard/session",
                icon: Presentation,
                desc: "Teleprompter, timer & focused delivery.",
                gradient: "card-gradient-indigo",
              },
            ] as const).map(({ title, href, icon: Icon, desc, gradient }) => (
              <StaggerItem key={href}>
                <Link href={href} className="group outline-none block h-full">
                  <Card
                    className={`h-full ${gradient} bg-transparent text-white border-0 hover-lift shadow-lg overflow-hidden`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between pb-3">
                      <div className="space-y-1.5">
                        <CardTitle className="font-serif text-xl font-medium text-white">
                          {title}
                        </CardTitle>
                        <p className="text-sm text-white/75">{desc}</p>
                      </div>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-flex items-center text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                        Open {title.toLowerCase()}
                        <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      </AnimatedSection>

      {/* ── AI Tools — tinted cards with coloured left border ── */}
      <AnimatedSection delay={0.1}>
        <section>
          <h2 className="font-serif text-xl font-medium tracking-tight text-foreground mb-5">
            AI Tools
          </h2>
          <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {([
              {
                title: "Suggestions",
                href: "/dashboard/suggestions",
                icon: ListChecks,
                desc: "Ready-to-read wording",
                tint: "bg-primary/[0.06]",
                borderColor: "border-l-primary",
                iconBg: "bg-primary/12",
                iconColor: "text-primary",
                iconGlow: "icon-glow-emerald",
                linkColor: "text-primary",
              },
              {
                title: "Affirmations",
                href: "/dashboard/affirmations",
                icon: Sparkles,
                desc: "Generate 10 affirmations",
                tint: "bg-accent-amber/[0.07]",
                borderColor: "border-l-accent-amber",
                iconBg: "bg-accent-amber/12",
                iconColor: "text-accent-amber",
                iconGlow: "icon-glow-amber",
                linkColor: "text-accent-amber",
              },
              {
                title: "Tool Generator",
                href: "/dashboard/tool-generator",
                icon: Wrench,
                desc: "Tools, flow & cautions",
                tint: "bg-accent-rose/[0.06]",
                borderColor: "border-l-accent-rose",
                iconBg: "bg-accent-rose/12",
                iconColor: "text-accent-rose",
                iconGlow: "icon-glow-rose",
                linkColor: "text-accent-rose",
              },
              {
                title: "Post Engine",
                href: "/dashboard/random-post-engine",
                icon: Rss,
                desc: "Social media posts",
                tint: "bg-accent-teal/[0.06]",
                borderColor: "border-l-accent-teal",
                iconBg: "bg-accent-teal/12",
                iconColor: "text-accent-teal",
                iconGlow: "icon-glow-teal",
                linkColor: "text-accent-teal",
              },
            ] as const).map(
              ({ title, href, icon: Icon, desc, tint, borderColor, iconBg, iconColor, iconGlow, linkColor }) => (
                <StaggerItem key={href}>
                  <Link href={href} className="group outline-none block h-full">
                    <Card
                      className={`relative h-full ${tint} border-l-4 ${borderColor} border-t-0 border-r-0 border-b-0 hover-lift shadow-sm`}
                    >
                      <CardHeader className="pb-2 pt-5 px-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="font-serif text-base font-medium">
                              {title}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                          </div>
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} ${iconGlow}`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-5 pb-4 pt-1">
                        <span className={`text-xs font-medium ${linkColor} opacity-70 group-hover:opacity-100 transition-opacity inline-flex items-center`}>
                          Open
                          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
              )
            )}
          </StaggerContainer>
        </section>
      </AnimatedSection>

      {/* ── Library & Media — asymmetric, tinted backgrounds ── */}
      <AnimatedSection delay={0.15}>
        <section>
          <h2 className="font-serif text-xl font-medium tracking-tight text-foreground mb-5">
            Library & Media
          </h2>
          <StaggerContainer className="grid gap-5 sm:grid-cols-5">
            {/* Audio Studio — featured, takes 3/5 */}
            <StaggerItem className="sm:col-span-3">
              <Link href="/dashboard/audio" className="group outline-none block h-full">
                <Card className="relative h-full bg-accent-teal/[0.06] border-accent-teal/20 hover-lift shadow-sm overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-accent-teal/10 blur-[40px]" />
                    <div className="absolute right-12 bottom-0 w-32 h-32 rounded-full bg-primary/8 blur-[30px]" />
                  </div>
                  <CardHeader className="relative flex flex-row items-start justify-between pb-3">
                    <div className="space-y-1.5">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-white bg-accent-teal px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                      <CardTitle className="font-serif text-xl font-medium">
                        Audio Studio
                      </CardTitle>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Turn scripts into spoken audio. Mix voices with ambient layers and export MP3.
                      </p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-teal/12 text-accent-teal icon-glow-teal transition-colors group-hover:bg-accent-teal group-hover:text-white">
                      <Mic className="h-7 w-7" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <span className="inline-flex items-center text-sm font-medium text-accent-teal group-hover:text-accent-teal/80 transition-colors">
                      Open studio
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>

            {/* Script Library — 2/5, green tint */}
            <StaggerItem className="sm:col-span-2">
              <Link href="/dashboard/script-library" className="group outline-none block h-full">
                <Card className="h-full bg-primary/[0.05] border-primary/15 hover-lift shadow-sm">
                  <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <div className="space-y-1.5">
                      <CardTitle className="font-serif text-lg font-medium">
                        Script Library
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Browse scripts by category and export to PDF.
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary icon-glow-emerald transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Library className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                      Browse library
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </section>
      </AnimatedSection>

      {/* ── Reflection Room — spotlight card ── */}
      <AnimatedSection delay={0.2}>
        <section className="relative">
          <div className="absolute inset-0 -inset-x-4 -inset-y-2 rounded-3xl bg-accent-rose/8 blur-xl animate-pulse-glow pointer-events-none" />
          <Link href="/dashboard/reflection-room" className="group outline-none block relative">
            <Card className="card-gradient-rose bg-transparent text-white border-0 overflow-hidden relative">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-[250px] h-[250px] rounded-full bg-white/10 blur-[60px]" />
                <div className="absolute -bottom-1/4 -right-1/4 w-[200px] h-[200px] rounded-full bg-white/5 blur-[40px]" />
              </div>
              <CardHeader className="relative flex flex-row items-start justify-between pb-4 pt-8 px-8">
                <div className="space-y-2">
                  <CardTitle className="font-serif text-2xl font-medium text-white">
                    Reflection Room
                  </CardTitle>
                  <p className="text-base text-white/75 max-w-xl font-light">
                    Confidential AI supervision chat. Reflect on cases and explore ideas in a
                    private space.
                  </p>
                </div>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm text-white">
                  <MessageCircle className="h-7 w-7" />
                </div>
              </CardHeader>
              <CardContent className="relative px-8 pb-8">
                <span className="inline-flex items-center text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                  Enter Reflection Room
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </section>
      </AnimatedSection>
    </div>
  );
}
