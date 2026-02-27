export const MAX_SCRIPT_LENGTH = 4096;

export const VOICE_OPTIONS = [
  { value: "onyx", label: "Matthew (Deep, Calming, Male)" },
  { value: "shimmer", label: "Sarah (Soft, Soothing, Female)" },
  { value: "alloy", label: "James (Authoritative, British Male)" },
  { value: "nova", label: "Emma (Warm, Friendly, Female)" },
] as const;

export const PACING_OPTIONS = [
  { value: "extra-slow", label: "Extra slow (Deep relaxation)" },
  { value: "very-slow", label: "Very slow (Hypnotic)" },
  { value: "slow", label: "Slow (Relaxed)" },
  { value: "normal", label: "Normal (Conversational)" },
] as const;

export const PREVIEW_PHRASE =
  "You are now relaxed and safe. Breathe slowly and deeply.";

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
