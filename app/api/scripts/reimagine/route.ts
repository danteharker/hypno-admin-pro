import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reimagineScript } from "@/lib/openai-reimagine";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { content: string; title: string; section: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { content, title, section } = body;
  if (!content || !title) {
    return NextResponse.json({ error: "Missing content or title" }, { status: 400 });
  }

  try {
    const newContent = await reimagineScript(content, title);

    const { data: newScript, error } = await supabase
      .from("scripts")
      .insert({
        user_id: user.id,
        title: `${title} (Reimagined)`,
        content: newContent,
        category: section || null,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ id: newScript.id, content: newContent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reimagination failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
