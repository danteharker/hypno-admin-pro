import OpenAI from "openai";
import {
  TOOL_GENERATOR_SYSTEM_PROMPT,
  buildToolGeneratorUserPrompt,
} from "./prompts/tool-generator";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;
const MODEL = process.env.OPENAI_SCRIPT_MODEL || "gpt-4o-mini";

export async function generateToolPlan(presentingIssue: string): Promise<{
  content: string;
}> {
  if (!client) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local to use Tool Generator."
    );
  }
  const userPrompt = buildToolGeneratorUserPrompt(presentingIssue);
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: TOOL_GENERATOR_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.6,
    max_tokens: 1024,
  });
  const content =
    completion.choices[0]?.message?.content?.trim() ??
    "(No content generated.)";
  return { content };
}
