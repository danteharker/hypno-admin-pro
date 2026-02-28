"use client";

import { useEffect, useState } from "react";
import { useSubscription } from "@/lib/subscription-context";

type UsageType = "script_generation" | "audio_generation" | "ai_tool";

const LABELS: Record<UsageType, { used: string; limit: string }> = {
  script_generation: { used: "scripts used", limit: "5" },
  audio_generation: { used: "audio files used", limit: "3" },
  ai_tool: { used: "AI uses remaining", limit: "10" },
};

type Props = {
  type: UsageType;
  className?: string;
};

export function UsageIndicator({ type, className = "" }: Props) {
  const { status } = useSubscription();
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    if (status !== "trialing") return;
    fetch("/api/usage/status")
      .then((r) => r.json())
      .then((data) => {
        const u = data?.usage?.[type];
        if (u) setUsage({ used: u.used, limit: u.limit });
      })
      .catch(() => {});
  }, [status, type]);

  if (status !== "trialing" || !usage) return null;

  const { used, limit } = usage;
  const isAiTool = type === "ai_tool";
  const display = isAiTool ? `${Math.max(0, limit - used)} of ${limit} remaining` : `${used} of ${limit} ${LABELS[type].used}`;

  return (
    <p className={`text-sm text-muted-foreground ${className}`}>{display}</p>
  );
}
