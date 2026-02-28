import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { USAGE_LIMITS } from "@/lib/usage";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  const status = profile?.subscription_status ?? "incomplete";

  if (status !== "trialing") {
    return NextResponse.json({
      status,
      usage: null,
    });
  }

  const types = ["script_generation", "audio_generation", "ai_tool"] as const;
  const usage: Record<string, { used: number; limit: number }> = {};

  for (const type of types) {
    const { count } = await supabase
      .from("usage_tracking")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("usage_type", type);
    usage[type] = {
      used: count ?? 0,
      limit: USAGE_LIMITS[type],
    };
  }

  return NextResponse.json({ status: "trialing", usage });
}
