import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CheckCircle2 } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Hypno Admin Pro
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>
        <h1 className="mt-8 font-serif text-3xl font-medium text-foreground">
          Thank you
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          You&apos;re all set. Your 14-day free trial has started. Head to your dashboard to get going.
        </p>
        <Link href="/dashboard" className="mt-10 inline-block">
          <Button size="lg" className="rounded-full px-10 h-12">
            Go to dashboard
          </Button>
        </Link>
      </main>
    </div>
  );
}
