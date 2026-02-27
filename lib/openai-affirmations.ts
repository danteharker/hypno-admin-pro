import OpenAI from "openai";
import {
  AFFIRMATIONS_SYSTEM_PROMPT,
  buildAffirmationsUserPrompt,
} from "./prompts/affirmations";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;
const MODEL = process.env.OPENAI_SCRIPT_MODEL || "gpt-4o-mini";

/** Parse model output into up to 10 affirmation strings (one per line, strip numbers). */
function parseAffirmations(raw: string): string[] {
  const lines = raw
    .split(/\n/)
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, "").trim())
    .filter((line) => line.length > 0);
  return lines.slice(0, 10);
}

export async function generateAffirmations(topic: string): Promise<{
  affirmations: string[];
}> {
  if (!client) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local to use Affirmations."
    );
  }
  const userPrompt = buildAffirmationsUserPrompt(topic);
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: AFFIRMATIONS_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });
  const raw =
    completion.choices[0]?.message?.content?.trim() ?? "";
  const affirmations = parseAffirmations(raw);
  return { affirmations };
}
