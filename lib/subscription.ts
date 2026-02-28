import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionStatus =
  | "incomplete"
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export type SubscriptionInfo = {
  status: SubscriptionStatus;
  trialDaysRemaining: number | null;
  isActive: boolean;
};

export async function getSubscriptionStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionInfo> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("subscription_status, trial_ends_at")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return {
      status: "incomplete",
      trialDaysRemaining: null,
      isActive: false,
    };
  }

  const status = (profile.subscription_status as SubscriptionStatus) ?? "incomplete";
  const isActive = status === "trialing" || status === "active" || status === "past_due";

  let trialDaysRemaining: number | null = null;
  if (status === "trialing" && profile.trial_ends_at) {
    const end = new Date(profile.trial_ends_at);
    const now = new Date();
    const days = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    trialDaysRemaining = days;
  }

  return { status, trialDaysRemaining, isActive };
}
