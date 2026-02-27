import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

/** OpenAI TTS model. Use tts-1 for speed, tts-1-hd for higher quality. */
const TTS_MODEL = process.env.OPENAI_TTS_MODEL || "tts-1-hd";

/** Voice IDs supported by OpenAI TTS (alloy, ash, ballad, coral, echo, fable, onyx, nova, sage, shimmer, etc.). */
export type TTSVoiceId =
  | "onyx"   // deep, calming male
  | "shimmer" // soft, soothing female
  | "alloy"  // authoritative, neutral (we use as British male)
  | "nova";  // warm, friendly female

/** Pacing maps to speed multiplier (OpenAI: 0.25–4.0). */
export type TTSPacing = "extra-slow" | "very-slow" | "slow" | "normal";

const PACING_TO_SPEED: Record<TTSPacing, number> = {
  "extra-slow": 0.75,
  "very-slow": 0.85,
  "slow": 0.92,
  "normal": 1.0,
};

const MAX_INPUT_LENGTH = 4096;

/**
 * Generate speech from text using OpenAI TTS.
 * Returns MP3 buffer. Uses OPENAI_API_KEY from env.
 */
export async function generateSpeech(params: {
  text: string;
  voiceId: TTSVoiceId;
  pacing: TTSPacing;
}): Promise<Buffer> {
  if (!client) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local to use text-to-speech."
    );
  }
  const text = params.text.trim().slice(0, MAX_INPUT_LENGTH);
  if (!text) {
    throw new Error("Script text is required.");
  }
  const speed = PACING_TO_SPEED[params.pacing];
  const response = await client.audio.speech.create({
    model: TTS_MODEL as "tts-1" | "tts-1-hd" | "gpt-4o-mini-tts",
    voice: params.voiceId,
    input: text,
    speed,
    response_format: "mp3",
  });
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
