import type { SupabaseClient } from "@supabase/supabase-js";

export const USAGE_LIMITS = {
  script_generation: 5,
  audio_generation: 3,
  ai_tool: 10,
} as const;

export type UsageType = keyof typeof USAGE_LIMITS;

export type UsageCapResult = {
  allowed: boolean;
  used: number;
  limit: number;
};

export async function checkUsageCap(
  supabase: SupabaseClient,
  userId: string,
  usageType: UsageType
): Promise<UsageCapResult> {
  const limit = USAGE_LIMITS[usageType];

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", userId)
    .single();

  const status = profile?.subscription_status ?? "incomplete";
  if (status === "active" || status === "past_due") {
    return { allowed: true, used: 0, limit };
  }

  if (status !== "trialing") {
    return { allowed: false, used: 0, limit };
  }

  const { count, error } = await supabase
    .from("usage_tracking")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("usage_type", usageType);

  if (error) {
    return { allowed: false, used: 0, limit };
  }

  const used = count ?? 0;
  return {
    allowed: used < limit,
    used,
    limit,
  };
}

export async function recordUsage(
  supabase: SupabaseClient,
  userId: string,
  usageType: UsageType
): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", userId)
    .single();

  const status = profile?.subscription_status ?? "incomplete";
  if (status !== "trialing") {
    return;
  }

  await supabase.from("usage_tracking").insert({
    user_id: userId,
    usage_type: usageType,
  });
}
