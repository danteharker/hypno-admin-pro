/** Goal the client is working toward (free text). */
/** Tone: calm, authoritative, nurturing, direct, gentle, etc. */
/** Suggestion types: direct, permissive, compound, truism, etc. */

export const SUGGESTIONS_SYSTEM_PROMPT = `You are an expert hypnotherapist. Your task is to write ready-to-read hypnotic suggestions that a therapist can speak aloud during or after trance.

Rules:
- Output only the suggestion wording: no preamble, no labels, no "Here are some suggestions".
- Use clear, present-tense, positive language where appropriate.
- Match the requested tone and suggestion types.
- Each suggestion should be one or two sentences, spoken as if to the client.
- Format as a single block of text with suggestions separated by blank lines.
- Use British English spelling throughout (e.g. realise, organise, colour, harmonise).`;

export function buildSuggestionsUserPrompt(params: {
  goal: string;
  tone: string;
  suggestionTypes: string[];
}): string {
  const { goal, tone, suggestionTypes } = params;
  const typesList =
    suggestionTypes.length > 0
      ? suggestionTypes.join(", ")
      : "direct and permissive (mix)";
  return `Generate hypnotic suggestions for the following.

**Client goal:** ${goal.trim()}

**Tone:** ${tone.trim()}

**Suggestion types to use:** ${typesList}

Output 5–8 ready-to-read suggestions, one per block, that the therapist can read verbatim.`;
}
