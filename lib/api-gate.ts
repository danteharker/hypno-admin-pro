import type { SupabaseClient } from "@supabase/supabase-js";
import { checkUsageCap, recordUsage, type UsageType } from "./usage";

const BLOCKED_STATUSES = ["incomplete", "cancelled", "expired"] as const;

export type CheckAccessResult =
  | { allowed: true }
  | { allowed: false; error: string; status: number; used?: number; limit?: number };

export async function checkAccess(
  supabase: SupabaseClient,
  userId: string,
  usageType: UsageType
): Promise<CheckAccessResult> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", userId)
    .single();

  const status = profile?.subscription_status ?? "incomplete";

  if (BLOCKED_STATUSES.includes(status as (typeof BLOCKED_STATUSES)[number])) {
    return {
      allowed: false,
      error: "Subscription required",
      status: 403,
    };
  }

  const cap = await checkUsageCap(supabase, userId, usageType);
  if (!cap.allowed) {
    return {
      allowed: false,
      error: "Trial limit reached",
      status: 403,
      used: cap.used,
      limit: cap.limit,
    };
  }

  return { allowed: true };
}

export { recordUsage };
