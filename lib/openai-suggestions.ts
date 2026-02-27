import OpenAI from "openai";
import {
  SUGGESTIONS_SYSTEM_PROMPT,
  buildSuggestionsUserPrompt,
} from "./prompts/suggestions";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;
const MODEL = process.env.OPENAI_SCRIPT_MODEL || "gpt-4o-mini";

export async function generateSuggestions(params: {
  goal: string;
  tone: string;
  suggestionTypes: string[];
}): Promise<{ wording: string }> {
  if (!client) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local to use Suggestions."
    );
  }
  const userPrompt = buildSuggestionsUserPrompt(params);
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SUGGESTIONS_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });
  const wording =
    completion.choices[0]?.message?.content?.trim() ?? "(No suggestions generated.)";
  return { wording };
}
