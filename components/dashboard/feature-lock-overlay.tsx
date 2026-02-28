"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/subscription-context";
import { Lock } from "lucide-react";

type Props = {
  children: ReactNode;
  requireActive?: boolean;
};

export function FeatureLockOverlay({ children, requireActive = true }: Props) {
  const { isActive } = useSubscription();
  const [loading, setLoading] = useState(false);

  if (isActive) return <>{children}</>;
  if (!requireActive) return <>{children}</>;

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data?.url) window.location.href = data.url;
    else setLoading(false);
  };

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-card p-8 text-center">
          <Lock className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-foreground">Subscribe to continue creating</p>
          <Button onClick={handleSubscribe} disabled={loading}>
            {loading ? "Redirecting…" : "Subscribe for £8/month"}
          </Button>
        </div>
      </div>
    </div>
  );
}
