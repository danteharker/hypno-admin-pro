import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getReflectionRoomReply } from "@/lib/openai-reflection-room";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in to use the Reflection Room." },
      { status: 401 }
    );
  }

  let body: {
    message?: string;
    messages?: { role: "user" | "assistant"; content: string }[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { message, messages: existingMessages } = body;
  if (!message?.trim()) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  const thread: { role: "user" | "assistant"; content: string }[] = Array.isArray(
    existingMessages
  )
    ? existingMessages.filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
    : [];
  thread.push({ role: "user", content: message.trim() });

  try {
    const { reply } = await getReflectionRoomReply(thread);
    return NextResponse.json({ reply });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Reflection Room request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
