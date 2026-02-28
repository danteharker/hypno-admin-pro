"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/subscription-context";

export function IncompleteOverlay() {
  const { status } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status !== "incomplete") return null;

  const handleStartTrial = async () => {
    setError(null);
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
      setError(data?.error || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-2xl border border-border/50 bg-card p-8 text-center shadow-lg">
        <h2 className="font-serif text-2xl font-medium text-foreground">
          Welcome! Start your 14-day free trial
        </h2>
        <p className="mt-4 text-muted-foreground">
          Full access to all features. Cancel anytime. £8/month after trial.
        </p>
        {error && (
          <p className="mt-4 text-sm text-destructive">{error}</p>
        )}
        <Button
          size="lg"
          className="mt-8 rounded-full px-10"
          onClick={handleStartTrial}
          disabled={loading}
        >
          {loading ? "Redirecting…" : "Start free trial"}
        </Button>
      </div>
    </div>
  );
}
