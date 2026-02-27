import OpenAI from "openai";
import {
  SCRIPT_SYSTEM_PROMPT,
  buildScriptUserPrompt,
  buildSectionContext,
  buildSectionUserPrompt,
  buildLengthenUserPrompt,
  type DurationKey,
  type InductionKey,
  type ScriptCategory,
  type DeepenerKey,
  type TherapeuticApproachKey,
  type ClientPronounKey,
  type ScriptSectionKey,
} from "./prompts/script-generation";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

/** Cost-effective default; override with OPENAI_SCRIPT_MODEL in .env.local if desired (e.g. gpt-4o). */
const SCRIPT_MODEL = process.env.OPENAI_SCRIPT_MODEL || "gpt-4o-mini";

export async function generateScript(params: {
  category: ScriptCategory;
  customCategory?: string;
  clientProfile: string;
  metaphors?: string;
  duration: DurationKey;
  inductionStyle: InductionKey;
  deepenerStyle?: DeepenerKey;
  therapeuticApproach?: TherapeuticApproachKey;
  clientPronoun?: ClientPronounKey;
}): Promise<{ content: string; suggestedTitle: string }> {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.local to use AI script generation.");
  }
  const userPrompt = buildScriptUserPrompt(params);
  const completion = await client.chat.completions.create({
    model: SCRIPT_MODEL,
    messages: [
      { role: "system", content: SCRIPT_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 12288, // ~9k words at 130 wpm; enough for Long (5,200–7,150 words)
  });
  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  const categoryLabel =
    params.category === "custom" && params.customCategory?.trim()
      ? params.customCategory.trim()
      : params.category === "custom"
        ? "Custom Script"
        : params.category.charAt(0).toUpperCase() + params.category.slice(1);
  const suggestedTitle = `Generated: ${categoryLabel}`;
  return { content: content || "(No content generated.)", suggestedTitle };
}

export type SectionContextParams = {
  category: ScriptCategory;
  customCategory?: string;
  clientProfile: string;
  metaphors?: string;
  duration?: DurationKey;
  inductionStyle: InductionKey;
  deepenerStyle?: DeepenerKey;
  therapeuticApproach?: TherapeuticApproachKey;
  clientPronoun?: ClientPronounKey;
};

/** Generate a single section of a script. Returns only that section's text. */
export async function generateScriptSection(
  section: ScriptSectionKey,
  params: SectionContextParams
): Promise<string> {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.local to use AI script generation.");
  }
  const context = buildSectionContext(params);
  const userPrompt = buildSectionUserPrompt(section, context);
  const completion = await client.chat.completions.create({
    model: SCRIPT_MODEL,
    messages: [
      { role: "system", content: SCRIPT_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });
  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  return content || "(No content generated.)";
}

/** Lengthen/expand an existing section. Returns the expanded text. */
export async function lengthenScriptSection(
  section: ScriptSectionKey,
  existingText: string
): Promise<string> {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.local to use AI script generation.");
  }
  const userPrompt = buildLengthenUserPrompt(section, existingText);
  const completion = await client.chat.completions.create({
    model: SCRIPT_MODEL,
    messages: [
      { role: "system", content: SCRIPT_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });
  const content = completion.choices[0]?.message?.content?.trim() ?? "";
  return content || existingText;
}
