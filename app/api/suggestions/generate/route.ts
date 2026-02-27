import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSuggestions } from "@/lib/openai-suggestions";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { goal: string; tone: string; suggestionTypes: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { goal, tone, suggestionTypes } = body;
  if (!goal?.trim()) {
    return NextResponse.json(
      { error: "Goal is required." },
      { status: 400 }
    );
  }

  try {
    const { wording } = await generateSuggestions({
      goal: goal.trim(),
      tone: (tone || "calm").trim(),
      suggestionTypes: Array.isArray(suggestionTypes) ? suggestionTypes : [],
    });
    return NextResponse.json({ wording });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Suggestions generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
