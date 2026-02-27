import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

/** Same as script generation; use gpt-4o-mini by default. Override with OPENAI_SCRIPT_MODEL if set. */
const SCRIPT_MODEL = process.env.OPENAI_SCRIPT_MODEL || "gpt-4o-mini";

const MODIFY_SYSTEM_PROMPT = `You are an experienced clinical hypnotherapist. You will be given a hypnotherapy script and the user's requested changes. Output the full revised script only, with no preamble or explanation. Keep the same structure (e.g. [PRE-TALK NOTES], [INDUCTION], [DEEPENER], [INTERVENTION], [AWAKENING]) unless the user asks to change it. Use second person ("you"). Use British English spelling.`;

export async function modifyScriptWithAI(
  content: string,
  userInstructions: string
): Promise<string> {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not set. Add it to .env.local to use Edit with AI.");
  }
  const completion = await client.chat.completions.create({
    model: SCRIPT_MODEL,
    messages: [
      { role: "system", content: MODIFY_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Here is the current script:\n\n${content}\n\n---\n\nUser requested changes: ${userInstructions}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 4096,
  });
  const revised = completion.choices[0]?.message?.content?.trim() ?? "";
  return revised || content;
}
