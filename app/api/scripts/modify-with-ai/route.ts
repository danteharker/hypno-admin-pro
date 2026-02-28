import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { modifyScriptWithAI } from "@/lib/openai-modify";
import { checkAccess, recordUsage } from "@/lib/api-gate";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await checkAccess(supabase, user.id, "script_generation");
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.error, used: access.used, limit: access.limit },
      { status: access.status }
    );
  }

  let body: { content: string; userInstructions: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { content, userInstructions } = body;
  if (typeof content !== "string" || typeof userInstructions !== "string" || !userInstructions.trim()) {
    return NextResponse.json(
      { error: "Missing or invalid content and userInstructions" },
      { status: 400 }
    );
  }

  try {
    const revised = await modifyScriptWithAI(content, userInstructions.trim());
    await recordUsage(supabase, user.id, "script_generation");
    return NextResponse.json({ content: revised });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Modification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
