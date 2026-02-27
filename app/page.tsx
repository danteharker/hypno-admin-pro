import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  FileText,
  Mic,
  Users,
  Presentation,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  Lock,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI script engine",
    description:
      "Generate tailored scripts by category. Answer a short questionnaire; get a full script you can edit and save.",
    iconClass: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  },
  {
    icon: Mic,
    title: "Audio studio",
    description:
      "Turn scripts into spoken audio. Add ambient layers, pick voices, export MP3 for clients.",
    iconClass: "bg-chart-2/20 text-chart-2 group-hover:bg-chart-2 group-hover:text-white dark:group-hover:text-gray-900",
  },
  {
    icon: Users,
    title: "Client management",
    description:
      "Profiles, session logs, and history. Start a session in one click.",
    iconClass: "bg-chart-3/20 text-chart-3 group-hover:bg-chart-3 group-hover:text-white dark:group-hover:text-gray-900",
  },
  {
    icon: Presentation,
    title: "Session delivery",
    description:
      "Teleprompter and timer in a single focused session mode.",
    iconClass: "bg-chart-4/20 text-chart-4 group-hover:bg-chart-4 group-hover:text-white dark:group-hover:text-gray-900",
  },
  {
    icon: FileText,
    title: "Script library",
    description:
      "Browse, search, tag, and export your scripts to PDF.",
    iconClass: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Hypno Admin Pro
          </span>
          <nav className="flex items-center gap-2">
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
          <div className="relative mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-5xl font-medium tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Your practice,{" "}
              <span className="text-gradient italic">one workspace</span>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground sm:text-xl font-light leading-relaxed">
              AI script generation, audio creation, client management, and
              session delivery — built for hypnotherapists who take their craft
              seriously.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="min-w-[180px] rounded-full h-12 px-8 text-base">
                  Start free trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="min-w-[180px] rounded-full h-12 px-8 text-base bg-transparent hover:bg-muted/50">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="border-y border-border/40 bg-muted/30 px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Built for professional hypnotherapists
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="h-5 w-5 text-primary/80" />
              Secure & confidential
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-5 w-5 text-primary/80" />
              Client data in your control
            </span>
          </div>
        </section>

        <section className="border-b border-border/40 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-3xl font-medium text-foreground sm:text-4xl">
              Everything you need in one place
            </h2>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description, iconClass }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-border/40 bg-background/50 p-8 shadow-sm transition-smooth hover-lift hover:border-primary/20 hover:bg-background"
                >
                  <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${iconClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-24 sm:px-6">
          <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">
              Simple pricing
            </h2>
            <p className="mt-6 text-lg font-light text-muted-foreground">
              Free to start. Full access to scripts, audio, clients, and session tools.
            </p>
            <div className="mt-12 overflow-hidden rounded-3xl border border-border/50 glass p-10 shadow-sm">
              <p className="font-serif text-4xl font-medium text-foreground">Free to start</p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Create an account and use the full workspace. No credit card required.
              </p>
              <Link href="/register" className="mt-10 inline-block">
                <Button size="lg" className="rounded-full px-10 h-12">Get started free</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-border/40 px-4 py-24 sm:px-6">
          <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">
              Ready to streamline your practice?
            </h2>
            <p className="mt-6 text-lg font-light text-muted-foreground">
              Join therapists who keep scripts, clients, and sessions in one
              place.
            </p>
            <Link href="/register" className="mt-10 inline-block">
              <Button size="lg" className="rounded-full px-10 h-12">Create your account</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="font-serif text-lg font-medium text-foreground">Hypno Admin Pro</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Your practice, one workspace. For professional hypnotherapists.
              </p>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-smooth">
                Sign in
              </Link>
              <Link href="/register" className="text-muted-foreground hover:text-foreground transition-smooth">
                Get started
              </Link>
            </nav>
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hypno Admin Pro. For professional use only.
          </p>
        </div>
      </footer>
    </div>
  );
}
