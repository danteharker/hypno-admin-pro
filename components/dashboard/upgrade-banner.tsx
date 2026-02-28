"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/subscription-context";
import { X } from "lucide-react";

export function UpgradeBanner() {
  const { status, isActive } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (isActive || dismissed) return null;

  const isPastDue = status === "past_due";
  const isIncomplete = status === "incomplete";
  const message = isPastDue
    ? "We couldn't process your payment. Please update your card."
    : isIncomplete
      ? "Start your 14-day free trial — full access, then £8/month. Cancel anytime."
      : "Your trial has ended. Subscribe for just £8/month to keep creating.";

  const handleCta = async () => {
    const url = isPastDue ? "/api/stripe/portal" : "/api/stripe/checkout";
    const res = await fetch(url, { method: "POST" });
    const data = await res.json();
    if (data?.url) window.location.href = data.url;
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
      <p className="text-foreground">{message}</p>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleCta}>
          {isPastDue ? "Update payment" : isIncomplete ? "Start free trial" : "Subscribe"}
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
