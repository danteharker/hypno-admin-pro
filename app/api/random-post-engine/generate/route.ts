import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSocialPosts } from "@/lib/openai-random-post-engine";
import type { Platform } from "@/lib/prompts/random-post-engine";

const VALID_PLATFORMS: Platform[] = ["x", "facebook", "linkedin", "blog"];

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { services: string; themes: string; expertise: string; platform: Platform; link?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { services, themes, expertise, platform, link } = body;

  if (!services?.trim() || !themes?.trim() || !expertise?.trim()) {
    return NextResponse.json(
      { error: "Services, themes, and expertise are all required." },
      { status: 400 }
    );
  }

  if (!platform || !VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json(
      { error: "A valid platform must be selected." },
      { status: 400 }
    );
  }

  try {
    const { content } = await generateSocialPosts(
      services.trim(),
      themes.trim(),
      expertise.trim(),
      platform,
      link?.trim() || undefined
    );
    return NextResponse.json({ content });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Random Post Engine failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
