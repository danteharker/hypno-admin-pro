import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateScript } from "@/lib/openai";
import { checkAccess, recordUsage } from "@/lib/api-gate";
import type {
  DurationKey,
  InductionKey,
  ScriptCategory,
  DeepenerKey,
  TherapeuticApproachKey,
  ClientPronounKey,
} from "@/lib/prompts/script-generation";

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

  let body: {
    category: ScriptCategory;
    customCategory?: string;
    clientProfile: string;
    metaphors?: string;
    duration: DurationKey;
    inductionStyle: InductionKey;
    deepenerStyle?: DeepenerKey;
    therapeuticApproach?: TherapeuticApproachKey;
    clientPronoun?: ClientPronounKey;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { category, customCategory, clientProfile, metaphors, duration, inductionStyle, deepenerStyle, therapeuticApproach, clientPronoun } = body;
  if (!category || !clientProfile || !duration || !inductionStyle) {
    return NextResponse.json(
      { error: "Missing required fields: category, clientProfile, duration, inductionStyle" },
      { status: 400 }
    );
  }

  if (category === "custom" && !customCategory?.trim()) {
    return NextResponse.json(
      { error: "Please specify the category when selecting Other." },
      { status: 400 }
    );
  }

  try {
    const { content, suggestedTitle } = await generateScript({
      category,
      customCategory: category === "custom" ? customCategory?.trim() : undefined,
      clientProfile,
      metaphors,
      duration,
      inductionStyle,
      deepenerStyle,
      therapeuticApproach,
      clientPronoun,
    });
    await recordUsage(supabase, user.id, "script_generation");
    return NextResponse.json({ content, suggestedTitle });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Script generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
