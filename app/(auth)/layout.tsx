import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Branded panel: top banner on mobile, full left panel on desktop */}
      <div className="bg-gradient-panel text-white md:flex md:min-w-[42%] md:flex-col md:justify-center md:px-12 md:py-16">
        <div className="relative flex flex-col items-center justify-center px-6 py-10 md:items-start md:py-0 md:pl-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,oklch(1_0_0/0.06),transparent)] pointer-events-none md:bg-[radial-gradient(ellipse_60%_80%_at_20%_50%,oklch(1_0_0/0.08),transparent)]" />
          <Link
            href="/"
            className="relative z-10 flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <span className="font-serif text-2xl font-semibold tracking-tight">
              Hypno Admin Pro
            </span>
          </Link>
          <p className="relative z-10 mt-4 max-w-sm text-center text-white/90 text-lg font-light leading-relaxed md:mt-8 md:text-left">
            Your practice, one workspace. AI scripts, client management, and
            session delivery for professional hypnotherapists.
          </p>
        </div>
      </div>
      {/* Form panel */}
      <div className="relative flex flex-1 items-center justify-center bg-background px-4 py-8 md:py-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
