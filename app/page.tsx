"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatedSection } from "@/components/motion/animated-section";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger-children";
import {
  Mic,
  Users,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  Lock,
  PenLine,
  Layers,
  Share2,
  FolderSearch,
  Calendar,
  BarChart3,
  BookOpen,
  MonitorPlay,
  MessageSquareText,
  Heart,
  Wrench,
  BrainCircuit,
} from "lucide-react";

const PAIN_POINTS = [
  {
    icon: PenLine,
    text: "Staring at a blank screen trying to draft a bespoke script right before a session.",
  },
  {
    icon: Layers,
    text: "Fumbling with five different apps just to record, mix, and send an audio track.",
  },
  {
    icon: Share2,
    text: "Feeling the endless pressure to post on social media when you'd rather be helping people.",
  },
  {
    icon: FolderSearch,
    text: "Losing track of which script you used for which client last month.",
  },
];

const FEATURE_GROUPS = [
  {
    groupTitle: "Your Content Studio",
    accentBarClass: "accent-bar-emerald",
    cardGradientClass: "card-gradient-emerald",
    iconClass:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    heroFeature: {
      icon: Sparkles,
      title: "The Invisible AI",
      subtitle: "Scripts written for you",
      description:
        "You don't need to learn how to write AI prompts. Tell the system the topic, and it delivers a complete, personal script ready to edit or use.",
    },
    supportingFeatures: [
      {
        icon: BookOpen,
        title: "Script Library",
        subtitle: "100+ reference scripts",
        description:
          "Browse pre-written scripts by category. Use as-is or tap Reimagine with AI to make any script your own.",
      },
      {
        icon: MessageSquareText,
        title: "Suggestions Generator",
        subtitle: "Hypnotic suggestion wording",
        description:
          "Get ready-to-read suggestion phrasing by goal, tone, and type — direct, permissive, compound, and more.",
      },
      {
        icon: Heart,
        title: "Affirmations Generator",
        subtitle: "Topic-based affirmations",
        description:
          "Generate sets of affirmations for any intention. Copy one or all, in the second-person format that works in practice.",
      },
    ],
  },
  {
    groupTitle: "In the Session Room",
    accentBarClass: "accent-bar-amber",
    cardGradientClass: "card-gradient-amber",
    iconClass:
      "bg-chart-4/20 text-chart-4 group-hover:bg-chart-4 group-hover:text-white dark:group-hover:text-gray-900",
    heroFeature: {
      icon: MonitorPlay,
      title: "Session Mode",
      subtitle: "Teleprompter built for therapists",
      description:
        "Run scripts with auto-scroll, adjustable speed, and pause cues. Fullscreen, keyboard shortcuts, and one-tap session logging to the client record.",
    },
    supportingFeatures: [
      {
        icon: Mic,
        title: "Audio Studio",
        subtitle: "Turn scripts into audio",
        description:
          "Record spoken audio from any script, add calming background sounds, and send the MP3 straight to your client.",
      },
      {
        icon: Wrench,
        title: "Tool Generator",
        subtitle: "AI session planning",
        description:
          "Enter the presenting issue and get therapeutic tools, a suggested session flow, and cautions — then turn reflection into a plan.",
      },
    ],
  },
  {
    groupTitle: "Your Practice, Organised",
    accentBarClass: "accent-bar-rose",
    cardGradientClass: "card-gradient-rose",
    iconClass:
      "bg-chart-2/20 text-chart-2 group-hover:bg-chart-2 group-hover:text-white dark:group-hover:text-gray-900",
    heroFeature: {
      icon: Users,
      title: "Client Management",
      subtitle: "All your clients, one place",
      description:
        "Names, notes, session history — everything in one tidy view. No more digging through notebooks. Plus a distraction-free session screen for running sessions.",
    },
    supportingFeatures: [
      {
        icon: BrainCircuit,
        title: "Reflection Room",
        subtitle: "Confidential AI supervision",
        description:
          "Reflect on tricky cases, ethics, or boundaries in a private AI chat. Nothing is stored; use it to think out loud and stay on track.",
      },
      {
        icon: Share2,
        title: "Social Media, Sorted",
        isNew: true,
        description:
          "The built-in Random Post Engine generates engaging, professional posts in seconds — without overthinking or spending hours on social platforms.",
      },
    ],
  },
];

const COMING_SOON = [
  { icon: Calendar, label: "Integrated Calendaring & Scheduling" },
  { icon: BarChart3, label: "Business Planning & Analytics Tools" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="font-serif text-2xl font-semibold tracking-tight text-foreground"
          >
            Hypno Admin Pro
          </Link>
          <nav className="flex items-center gap-4">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth hidden sm:inline"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth hidden sm:inline"
            >
              Pricing
            </a>
            <a
              href="#roadmap"
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth hidden sm:inline"
            >
              Roadmap
            </a>
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative px-4 py-24 sm:px-6 md:py-32">
          <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
          <AnimatedSection className="relative mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-5xl font-medium tracking-tight text-foreground sm:text-6xl md:text-7xl">
              You became a therapist to transform lives,{" "}
              <span className="text-gradient italic">not wrestle with software.</span>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground sm:text-xl font-light leading-relaxed">
              Designed by a hypnotherapist, for hypnotherapists. The all-in-one
              workspace that handles your scripts, audio, and marketing behind the
              scenes, so you can focus on your clients.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="min-w-[180px] rounded-full h-12 px-8 text-base"
                >
                  Start free trial
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              14-day free trial. No tech skills needed. Cancel anytime.
            </p>
          </AnimatedSection>
        </section>

        <section className="border-y border-border/40 bg-muted/30 px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Designed by a hypnotherapist, for hypnotherapists
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="h-5 w-5 text-primary/80" />
              No tech skills needed — if you can send an email, you can use this
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-5 w-5 text-primary/80" />
              Your data stays yours — always
            </span>
          </div>
        </section>

        <section className="border-b border-border/40 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-3xl font-medium text-foreground sm:text-4xl">
              Sound familiar?
            </h2>
            <StaggerContainer className="mt-16 grid gap-8 sm:grid-cols-2 max-w-4xl mx-auto">
              {PAIN_POINTS.map(({ icon: Icon, text }) => (
                <StaggerItem key={text}>
                  <div className="group rounded-2xl border border-border/40 bg-background/50 p-8 shadow-sm transition-smooth hover-lift hover:border-primary/20 hover:bg-background flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed pt-1">
                      {text}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section
          id="features"
          className="border-b border-border/40 px-4 py-24 sm:px-6 scroll-mt-20"
        >
          <div className="mx-auto max-w-6xl">
            <AnimatedSection>
              <h2 className="text-center font-serif text-3xl font-medium text-foreground sm:text-4xl">
                Less admin. More time with clients.
              </h2>
            </AnimatedSection>
            <div className="mt-16 space-y-16">
              {FEATURE_GROUPS.map((group, groupIndex) => (
                <AnimatedSection key={group.groupTitle} delay={groupIndex * 0.08}>
                  <div className={`accent-bar ${group.accentBarClass} rounded-2xl border border-border/40 bg-background/30 pt-[3px]`}>
                    <div className="p-6 sm:p-8">
                      <p className="mb-6 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        {group.groupTitle}
                      </p>
                      <div className={`rounded-xl overflow-hidden border-0 p-6 sm:p-8 text-white ${group.cardGradientClass}`}>
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                          <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20">
                            <group.heroFeature.icon className="h-7 w-7" />
                          </div>
                          <div>
                            <h3 className="font-serif text-xl font-medium sm:text-2xl">
                              {group.heroFeature.title}
                            </h3>
                            {group.heroFeature.subtitle && (
                              <p className="mt-1 text-sm text-white/90">
                                {group.heroFeature.subtitle}
                              </p>
                            )}
                            <p className="mt-3 text-sm leading-relaxed text-white/90">
                              {group.heroFeature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {group.supportingFeatures.map((feature, i) => {
                          const Icon = feature.icon;
                          return (
                            <AnimatedSection key={feature.title} delay={0.05 * (groupIndex + i)}>
                              <div className="group rounded-2xl border border-border/40 bg-background/50 p-6 shadow-sm transition-smooth hover-lift hover:border-primary/20 hover:bg-background">
                                <div
                                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${group.iconClass}`}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-serif text-base font-medium text-foreground">
                                    {feature.title}
                                  </h4>
                                  {feature.isNew && (
                                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                                      New
                                    </span>
                                  )}
                                </div>
                                {feature.subtitle && (
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {feature.subtitle}
                                  </p>
                                )}
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                  {feature.description}
                                </p>
                              </div>
                            </AnimatedSection>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section
          id="roadmap"
          className="border-b border-border/40 px-4 py-24 sm:px-6 scroll-mt-20"
        >
          <div className="mx-auto max-w-4xl">
            <AnimatedSection>
              <h2 className="text-center font-serif text-3xl font-medium text-foreground sm:text-4xl">
                Built by a hypnotherapist with 25 years of experience.
              </h2>
              <p className="mt-6 text-center text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                We’re adding the same tools we use in practice—so you can use them too.
              </p>
            </AnimatedSection>
            <StaggerContainer className="mt-12 flex flex-wrap justify-center gap-4">
              {COMING_SOON.map(({ icon: Icon, label }) => (
                <StaggerItem key={label}>
                  <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/50 px-6 py-4 shadow-sm">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Coming soon
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        <section
          id="pricing"
          className="relative overflow-hidden px-4 py-24 sm:px-6 scroll-mt-20"
        >
          <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
          <AnimatedSection className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">
              Simple pricing
            </h2>
            <p className="mt-6 text-lg font-light text-muted-foreground">
              One plan. No decision fatigue.
            </p>
            <div className="mt-12 overflow-hidden rounded-3xl border border-border/50 glass p-10 shadow-sm">
              <p className="font-serif text-4xl font-medium text-foreground">
                £8/month
              </p>
              <ul className="mt-6 text-left text-sm text-muted-foreground space-y-2 max-w-xs mx-auto">
                <li>Unlimited AI scripts & Script Library</li>
                <li>Suggestions & Affirmations generators</li>
                <li>Tool Generator & Reflection Room</li>
                <li>Audio Studio & Session teleprompter</li>
                <li>Client management</li>
                <li>Social Media Post Engine</li>
              </ul>
              <Link href="/register" className="mt-10 inline-block">
                <Button size="lg" className="rounded-full px-10 h-12">
                  Start free trial
                </Button>
              </Link>
              <p className="mt-4 text-xs text-muted-foreground">
                Cancel before your trial ends and you won&apos;t be charged.
              </p>
            </div>
          </AnimatedSection>
        </section>

        <section className="relative overflow-hidden border-t border-border/40 px-4 py-24 sm:px-6">
          <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
          <AnimatedSection className="relative mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">
              Spend less time on admin. More time doing what you love.
            </h2>
            <p className="mt-6 text-lg font-light text-muted-foreground">
              14-day free trial — no risk, cancel anytime.
            </p>
            <Link href="/register" className="mt-10 inline-block">
              <Button size="lg" className="rounded-full px-10 h-12">
                Create your account
              </Button>
            </Link>
          </AnimatedSection>
        </section>
      </main>

      <footer className="border-t border-border/40 px-4 py-10 sm:px-6">
        <AnimatedSection>
          <div className="mx-auto max-w-6xl">
            <p className="text-center text-sm text-muted-foreground mb-6">
              Spend less time on admin. More time doing what you love.
            </p>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <div className="text-center sm:text-left">
                <p className="font-serif text-lg font-medium text-foreground">
                  Hypno Admin Pro
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Your practice, one workspace. For professional hypnotherapists.
                </p>
              </div>
              <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Privacy
                </Link>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-muted-foreground hover:text-foreground transition-smooth"
                >
                  Get started
                </Link>
              </nav>
            </div>
            <p className="mt-8 text-center text-xs text-muted-foreground">
              Built by{" "}
              <Link
                href="https://danteharker.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
              >
                Dante Harker
              </Link>
              {" "}· © {new Date().getFullYear()} Dante Harker. For professional use
              only.
            </p>
          </div>
        </AnimatedSection>
      </footer>
    </div>
  );
}
