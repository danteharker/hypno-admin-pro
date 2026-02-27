/** Words per minute for paced hypnotic speaking. */
export const HYPNOTIC_WPM = 130;

/**
 * Counts the number of words in a string (whitespace-separated, non-empty).
 */
export function countWords(text: string): number {
  if (!text || typeof text !== "string") return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((s) => s.length > 0).length;
}

/**
 * Calculates hypnotic reading time: total words ÷ 130 wpm, rounded to nearest whole minute.
 */
export function getHypnoticReadingTimeMinutes(text: string): number {
  const words = countWords(text);
  return Math.round(words / HYPNOTIC_WPM);
}

/**
 * Returns a display string for word count and estimated time, e.g. "260 words • ~2 mins".
 */
export function formatWordCountAndTime(text: string): string {
  const words = countWords(text);
  const mins = getHypnoticReadingTimeMinutes(text);
  return `${words.toLocaleString()} words • ~${mins} min${mins !== 1 ? "s" : ""}`;
}
