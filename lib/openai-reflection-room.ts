import OpenAI from "openai";
import {
  REFLECTION_ROOM_SYSTEM_PROMPT,
  getReflectionRoomReferenceContext,
} from "./prompts/reflection-room";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;
const MODEL = process.env.OPENAI_SCRIPT_MODEL || "gpt-4o-mini";

export type ReflectionMessage = { role: "user" | "assistant"; content: string };

export async function getReflectionRoomReply(messages: ReflectionMessage[]): Promise<{
  reply: string;
}> {
  if (!client) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local to use Reflection Room."
    );
  }
  const systemContent =
    REFLECTION_ROOM_SYSTEM_PROMPT + getReflectionRoomReferenceContext();
  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemContent },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: chatMessages,
    temperature: 0.6,
    max_tokens: 1024,
  });
  const reply =
    completion.choices[0]?.message?.content?.trim() ??
    "I'm sorry, I couldn't generate a reply. Please try again.";
  return { reply };
}
