import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateToolPlan } from "@/lib/openai-tool-generator";
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

  let body: { presentingIssue: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { presentingIssue } = body;
  if (!presentingIssue?.trim()) {
    return NextResponse.json(
      { error: "Presenting issue is required." },
      { status: 400 }
    );
  }

  try {
    const { content } = await generateToolPlan(presentingIssue.trim());
    await recordUsage(supabase, user.id, "ai_tool");
    return NextResponse.json({ content });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Tool Generator failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
