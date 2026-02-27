import OpenAI from "openai";
import {
  buildSystemPrompt,
  buildRandomPostEngineUserPrompt,
  type Platform,
} from "./prompts/random-post-engine";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;
const MODEL = process.env.OPENAI_SCRIPT_MODEL || "gpt-4o-mini";

export async function generateSocialPosts(
  services: string,
  themes: string,
  expertise: string,
  platform: Platform,
  link?: string
): Promise<{ content: string }> {
  if (!client) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local to use Random Post Engine."
    );
  }

  const systemPrompt = buildSystemPrompt(platform);
  const userPrompt = buildRandomPostEngineUserPrompt(services, themes, expertise, platform, link);

  // X tweets need less tokens; blog ideas need a bit more
  const maxTokens = platform === "x" ? 600 : platform === "blog" ? 1000 : 1200;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: maxTokens,
  });

  const content =
    completion.choices[0]?.message?.content?.trim() ??
    "(No content generated.)";
  return { content };
}
