import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSpeech, type TTSVoiceId, type TTSPacing } from "@/lib/openai-tts";
import { checkAccess, recordUsage } from "@/lib/api-gate";

const VOICE_IDS: TTSVoiceId[] = ["onyx", "shimmer", "alloy", "nova"];
const PACING_OPTIONS: TTSPacing[] = ["extra-slow", "very-slow", "slow", "normal"];

function isValidVoice(v: string): v is TTSVoiceId {
  return VOICE_IDS.includes(v as TTSVoiceId);
}
function isValidPacing(p: string): p is TTSPacing {
  return PACING_OPTIONS.includes(p as TTSPacing);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await checkAccess(supabase, user.id, "audio_generation");
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.error, used: access.used, limit: access.limit },
      { status: access.status }
    );
  }

  let body: { text?: string; voiceId?: string; pacing?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json(
      { error: "Script text is required." },
      { status: 400 }
    );
  }

  const voiceId = isValidVoice(body.voiceId ?? "onyx") ? (body.voiceId as TTSVoiceId) : "onyx";
  const pacing = isValidPacing(body.pacing ?? "slow") ? (body.pacing as TTSPacing) : "slow";

  try {
    const buffer = await generateSpeech({ text, voiceId, pacing });
    await recordUsage(supabase, user.id, "audio_generation");
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "attachment; filename=\"voice-track.mp3\"",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Audio generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
