import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAffirmations } from "@/lib/openai-affirmations";
import { checkAccess, recordUsage } from "@/lib/api-gate";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await checkAccess(supabase, user.id, "ai_tool");
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.error, used: access.used, limit: access.limit },
      { status: access.status }
    );
  }

  let body: { topic: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const topic = body.topic?.trim();
  if (!topic) {
    return NextResponse.json(
      { error: "Topic, goal, or intention is required." },
      { status: 400 }
    );
  }

  try {
    const { affirmations } = await generateAffirmations(topic);
    await recordUsage(supabase, user.id, "ai_tool");
    return NextResponse.json({ affirmations });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Affirmations generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
