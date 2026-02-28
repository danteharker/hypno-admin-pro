import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateScriptSection, lengthenScriptSection } from "@/lib/openai";
import { checkAccess, recordUsage } from "@/lib/api-gate";
import type {
  ScriptCategory,
  DurationKey,
  InductionKey,
  DeepenerKey,
  TherapeuticApproachKey,
  ClientPronounKey,
  ScriptSectionKey,
} from "@/lib/prompts/script-generation";

const SECTIONS: ScriptSectionKey[] = [
  "induction",
  "deepener",
  "intervention",
  "postHypnoticSuggestions",
  "awakening",
];

function isScriptSectionKey(v: string): v is ScriptSectionKey {
  return SECTIONS.includes(v as ScriptSectionKey);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    action: "generate" | "lengthen";
    section: string;
    existingText?: string;
    category?: ScriptCategory;
    customCategory?: string;
    clientProfile?: string;
    metaphors?: string;
    duration?: DurationKey;
    inductionStyle?: InductionKey;
    deepenerStyle?: DeepenerKey;
    therapeuticApproach?: TherapeuticApproachKey;
    clientPronoun?: ClientPronounKey;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action, section } = body;
  if (!section || !isScriptSectionKey(section)) {
    return NextResponse.json(
      { error: "Missing or invalid section. Must be one of: induction, deepener, intervention, postHypnoticSuggestions, awakening." },
      { status: 400 }
    );
  }

  if (action === "lengthen") {
    const existingText = body.existingText?.trim();
    if (!existingText) {
      return NextResponse.json(
        { error: "Lengthen requires existingText." },
        { status: 400 }
      );
    }
    try {
      const content = await lengthenScriptSection(section, existingText);
      await recordUsage(supabase, user.id, "script_generation");
      return NextResponse.json({ content });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lengthen failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // action === "generate"
  const {
    category,
    customCategory,
    clientProfile,
    metaphors,
    duration,
    inductionStyle,
    deepenerStyle,
    therapeuticApproach,
    clientPronoun,
  } = body;
  if (!category || !clientProfile || !inductionStyle) {
    return NextResponse.json(
      { error: "Missing required fields for generate: category, clientProfile, inductionStyle" },
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
    const content = await generateScriptSection(section, {
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
    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Section generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
