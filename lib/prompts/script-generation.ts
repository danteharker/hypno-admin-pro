/**
 * System prompt for AI script generation. Master hypnotherapist persona with strict structure,
 * pacing cues, British English, and safety guardrails.
 */
export const SCRIPT_SYSTEM_PROMPT = `System Role & Persona:
You are a master clinical hypnotherapist, NLP practitioner, and expert scriptwriter with decades of clinical experience. Your task is to generate highly effective, safe, and professional hypnotherapy scripts for other qualified therapists to use with their clients. You possess a deep understanding of Ericksonian language patterns, direct and indirect suggestion, parts therapy, and sensory-rich language.

Input Variables:
You will receive a prompt containing the following parameters from the therapist:
- Primary Category
- Client Profile & Presenting Issue
- Preferred Metaphors / Language (including VAK preferences)
- Target Duration
- Induction Style

Output Structure & Formatting:
You must strictly format your output into clear sections using uppercase letters enclosed in square brackets. You must include the following sections in order:

[PRE-TALK NOTES] (Brief advice for the therapist on tone or pacing for this specific client).

[INDUCTION] (Written exactly in the style requested by the 'Induction Style' variable).

[DEEPENER]

[INTERVENTION] (The core therapeutic work addressing the 'Presenting Issue').

[AWAKENING] (A safe, positive, and grounding return to full awareness).

Length & Duration (critical):
The 'Target Duration' is the total time the script should take when read aloud at a calm, therapeutic pace (hypnosis is typically ~130 words per minute, slower than normal speech). The user will specify an exact word-count range for this session—you must meet that range so the script fills the requested time. If the requested duration is Standard or Long, the [INDUCTION], [DEEPENER] and especially [INTERVENTION] sections must be substantial. Expand imagery, suggestions, and pacing so the script hits the word-count target.

Linguistic Rules & Pacing:
- Pacing Cues: You must embed pacing and breathing instructions directly into the script using the exact format (Pause 3s) or (Pause 5s) to guide the therapist's delivery.
- Rhythm: Use ellipses (...) to indicate a natural softening of the voice and a moment for the client to process.
- Sensory Language: Actively weave in the 'Preferred Metaphors' provided. If visual, auditory, or kinaesthetic (VAK) preferences are mentioned, tailor the language heavily to those senses (e.g., "see the bright colours", "hear the soothing rhythm", "feel the heavy warmth").
- Tone: The language must be deeply calming, empowering, and strictly utilise British English spelling (e.g., harmonise, colour, relaxing).

Guardrails & Safety:
- Never include medical diagnoses or promise medical cures.
- If the presenting issue involves severe trauma, keep the intervention focused entirely on emotional regulation, safe spaces, and grounding, avoiding any regression or trauma-reliving techniques.
- Maintain a tone of absolute unconditional positive regard.

Output only the script text with the required sections; no preamble or explanation.`;

export type ScriptCategory =
  | "relaxation"
  | "anxiety"
  | "sleep"
  | "confidence"
  | "habits"
  | "weight"
  | "phobias"
  | "custom";

export type DurationKey = "short" | "medium" | "long";
export type InductionKey =
  | "progressive"
  | "breathing"
  | "staircase"
  | "confusion"
  | "direct";

export type DeepenerKey =
  | "staircase"
  | "lift"
  | "countdown"
  | "nature_walk"
  | "fractional";

export type TherapeuticApproachKey =
  | "direct_suggestion"
  | "metaphorical_journey"
  | "parts_integration"
  | "inner_child"
  | "rewind_nlp"
  | "cbt_focused";

/** Client gender for script language. "none" = not relevant (use they/them or neutral). */
export type ClientPronounKey = "none" | "she" | "he" | "they" | "other";

/** Therapeutic speaking pace for hypnosis (slower than ~150 wpm normal speech). */
export const HYPNOSIS_WPM = 130;

/** Duration options: [minMinutes, maxMinutes] for spoken length. */
export const DURATION_MINUTES: Record<DurationKey, [number, number]> = {
  short: [10, 15],
  medium: [20, 30],
  long: [40, 55],
};

export function buildScriptUserPrompt(params: {
  category: ScriptCategory;
  customCategory?: string;
  clientProfile: string;
  metaphors?: string;
  duration: DurationKey;
  inductionStyle: InductionKey;
  deepenerStyle?: DeepenerKey;
  therapeuticApproach?: TherapeuticApproachKey;
  clientPronoun?: ClientPronounKey;
}): string {
  const {
    category,
    customCategory,
    clientProfile,
    metaphors,
    duration,
    inductionStyle,
    deepenerStyle,
    therapeuticApproach,
    clientPronoun,
  } = params;
  const categoryLabels: Record<ScriptCategory, string> = {
    relaxation: "Deep relaxation and stress release",
    anxiety: "Anxiety and stress management",
    sleep: "Sleep induction and improved sleep quality",
    confidence: "Confidence and self-esteem",
    habits: "Habit control (e.g. smoking cessation)",
    weight: "Weight management and healthy habits",
    phobias: "Fears and phobias",
    custom: "General therapeutic change",
  };
  const inductionLabels: Record<InductionKey, string> = {
    progressive: "Progressive muscle relaxation",
    breathing: "Breath focus",
    staircase: "Staircase / deepening imagery",
    confusion: "Confusion technique",
    direct: "Direct suggestion",
  };
  const deepenerLabels: Record<DeepenerKey, string> = {
    staircase: "The Staircase",
    lift: "The Lift/Elevator",
    countdown: "10-to-1 Countdown",
    nature_walk: "Nature Walk",
    fractional: "Fractional Relaxation",
  };
  const therapeuticLabels: Record<TherapeuticApproachKey, string> = {
    direct_suggestion: "Direct Suggestion",
    metaphorical_journey: "Metaphorical Journey",
    parts_integration: "Parts Integration",
    inner_child: "Inner Child Work",
    rewind_nlp: "Rewind Technique / NLP",
    cbt_focused: "CBT-Focused",
  };

  const [minMin, maxMin] = DURATION_MINUTES[duration];
  const minWords = minMin * HYPNOSIS_WPM;
  const maxWords = maxMin * HYPNOSIS_WPM;
  const durationLabel =
    duration === "short"
      ? "Short"
      : duration === "medium"
        ? "Standard"
        : "Long";
  const durationLine = `${durationLabel} (${minMin}–${maxMin} min spoken at 130 wpm therapeutic pace). Target word count: ${minWords.toLocaleString()}–${maxWords.toLocaleString()} words total.`;

  let prompt = `Category: ${
    category === "custom" && customCategory?.trim()
      ? customCategory.trim()
      : categoryLabels[category]
  }
Target duration: ${durationLine}
Induction style: ${inductionLabels[inductionStyle]}
`;
  if (deepenerStyle) {
    prompt += `Deepener style: ${deepenerLabels[deepenerStyle]}\n`;
  }
  if (therapeuticApproach) {
    prompt += `Therapeutic approach: ${therapeuticLabels[therapeuticApproach]}\n`;
  }
  const pronounInstructions: Record<ClientPronounKey, string> = {
    none: "Gender is not relevant to this script; use they/them or neutral language when referring to the client.",
    she: "Use she/her pronouns when referring to the client.",
    he: "Use he/him pronouns when referring to the client.",
    they: "Use they/them pronouns when referring to the client.",
    other: "Use they/them or neutral language; the client prefers to self-describe.",
  };
  if (clientPronoun && clientPronoun !== "none") {
    prompt += `Client gender / pronouns: ${pronounInstructions[clientPronoun]}\n`;
  } else {
    prompt += `${pronounInstructions.none}\n`;
  }
  prompt += `
Client profile and presenting issue:
${clientProfile}
`;
  if (metaphors?.trim()) {
    prompt += `\nPreferred metaphors / language / modalities:\n${metaphors.trim()}\n`;
  }
  prompt += `\nGenerate a complete hypnotherapy script with [PRE-TALK NOTES], [INDUCTION], [DEEPENER], [INTERVENTION], and [AWAKENING] sections. The script must be ${minWords.toLocaleString()}–${maxWords.toLocaleString()} words in total (130 wpm = ${minMin}–${maxMin} min when read aloud)—do not make it shorter than this range.`;
  return prompt;
}

/** Section keys for the modular workspace. */
export type ScriptSectionKey =
  | "induction"
  | "deepener"
  | "intervention"
  | "postHypnoticSuggestions"
  | "awakening";

const SECTION_LABELS: Record<ScriptSectionKey, string> = {
  induction: "INDUCTION",
  deepener: "DEEPENER",
  intervention: "INTERVENTION",
  postHypnoticSuggestions: "POST-HYPNOTIC SUGGESTIONS",
  awakening: "AWAKENING",
};

export { SECTION_LABELS };

/** Human-readable section titles for UI. */
export const SECTION_TITLES: Record<ScriptSectionKey, string> = {
  induction: "Induction",
  deepener: "Deepener",
  intervention: "Intervention",
  postHypnoticSuggestions: "Post-Hypnotic Suggestions",
  awakening: "Awakening",
};

/** Shared context string for section generation (category, client, metaphors, styles). */
export function buildSectionContext(params: {
  category: ScriptCategory;
  customCategory?: string;
  clientProfile: string;
  metaphors?: string;
  duration?: DurationKey;
  inductionStyle: InductionKey;
  deepenerStyle?: DeepenerKey;
  therapeuticApproach?: TherapeuticApproachKey;
  clientPronoun?: ClientPronounKey;
}): string {
  const {
    category,
    customCategory,
    clientProfile,
    metaphors,
    duration,
    inductionStyle,
    deepenerStyle,
    therapeuticApproach,
    clientPronoun,
  } = params;
  const categoryLabels: Record<ScriptCategory, string> = {
    relaxation: "Deep relaxation and stress release",
    anxiety: "Anxiety and stress management",
    sleep: "Sleep induction and improved sleep quality",
    confidence: "Confidence and self-esteem",
    habits: "Habit control (e.g. smoking cessation)",
    weight: "Weight management and healthy habits",
    phobias: "Fears and phobias",
    custom: "General therapeutic change",
  };
  const inductionLabels: Record<InductionKey, string> = {
    progressive: "Progressive muscle relaxation",
    breathing: "Breath focus",
    staircase: "Staircase / deepening imagery",
    confusion: "Confusion technique",
    direct: "Direct suggestion",
  };
  const deepenerLabels: Record<DeepenerKey, string> = {
    staircase: "The Staircase",
    lift: "The Lift/Elevator",
    countdown: "10-to-1 Countdown",
    nature_walk: "Nature Walk",
    fractional: "Fractional Relaxation",
  };
  const therapeuticLabels: Record<TherapeuticApproachKey, string> = {
    direct_suggestion: "Direct Suggestion",
    metaphorical_journey: "Metaphorical Journey",
    parts_integration: "Parts Integration",
    inner_child: "Inner Child Work",
    rewind_nlp: "Rewind Technique / NLP",
    cbt_focused: "CBT-Focused",
  };
  let ctx = `Category: ${
    category === "custom" && customCategory?.trim()
      ? customCategory.trim()
      : categoryLabels[category]
  }
Induction style: ${inductionLabels[inductionStyle]}
`;
  if (duration) {
    const [minMin, maxMin] = DURATION_MINUTES[duration];
    const minWords = minMin * HYPNOSIS_WPM;
    const maxWords = maxMin * HYPNOSIS_WPM;
    const durationLabel =
      duration === "short" ? "Short" : duration === "medium" ? "Standard" : "Long";
    ctx = ctx.replace(
      "Induction style:",
      `Target duration: ${durationLabel} (${minMin}–${maxMin} min, ~${minWords}–${maxWords} words at 130 wpm).\nInduction style:`
    );
  }
  if (deepenerStyle) ctx += `Deepener style: ${deepenerLabels[deepenerStyle]}\n`;
  if (therapeuticApproach)
    ctx += `Therapeutic approach: ${therapeuticLabels[therapeuticApproach]}\n`;
  const pronounInstructions: Record<ClientPronounKey, string> = {
    none: "Gender is not relevant to this script; use they/them or neutral language when referring to the client.",
    she: "Use she/her pronouns when referring to the client.",
    he: "Use he/him pronouns when referring to the client.",
    they: "Use they/them pronouns when referring to the client.",
    other: "Use they/them or neutral language; the client prefers to self-describe.",
  };
  ctx += `Client gender / pronouns: ${pronounInstructions[clientPronoun ?? "none"]}\n`;
  ctx += `\nClient profile and presenting issue:\n${clientProfile}\n`;
  if (metaphors?.trim())
    ctx += `\nPreferred metaphors / language / modalities:\n${metaphors.trim()}\n`;
  return ctx;
}

/** User prompt to generate only one section. Output must be only that section's script text, no other sections or headers. */
export function buildSectionUserPrompt(
  section: ScriptSectionKey,
  context: string
): string {
  const label = SECTION_LABELS[section];
  const instructions: Record<ScriptSectionKey, string> = {
    induction: `Write ONLY the [INDUCTION] section. Use the induction style specified in the context. Include pacing cues like (Pause 3s). Do not include any other section headers or pre-talk.`,
    deepener: `Write ONLY the [DEEPENER] section. Use the deepener style from context if given. Include pacing cues. Do not include any other section headers.`,
    intervention: `Write ONLY the [INTERVENTION] section—the core therapeutic work addressing the presenting issue. Use the therapeutic approach from context if given. Include pacing cues and sensory language. Do not include any other section headers.`,
    postHypnoticSuggestions: `Write ONLY the [POST-HYPNOTIC SUGGESTIONS] section—specific suggestions that will carry over after the session (e.g. "Whenever you feel X, you will..."). Include pacing cues. Do not include any other section headers.`,
    awakening: `Write ONLY the [AWAKENING] section—a safe, gradual return to full awareness. Count up or use a gentle reorientation. Do not include any other section headers.`,
  };
  return `${context}\n\nTask: Generate only the [${label}] section of a hypnotherapy script.\n\n${instructions[section]}\n\nOutput only the script text for this section; no preamble or explanation.`;
}

/** Target extra words to add per "Lengthen" action (~3 min at 130 wpm). */
export const LENGTHEN_TARGET_EXTRA_WORDS = 390;

/** User prompt to lengthen/expand existing section text. Asks for ~400 extra words (~3 min). */
export function buildLengthenUserPrompt(
  section: ScriptSectionKey,
  existingText: string
): string {
  const label = SECTION_LABELS[section];
  return `The following is the current [${label}] section of a hypnotherapy script. Your task is to EXPAND it substantially: add approximately ${LENGTHEN_TARGET_EXTRA_WORDS} extra words (about 3 minutes of spoken content at 130 wpm). Weave in more detail, imagery, pacing cues like (Pause 3s), and sensory language. Keep the same tone, structure, and intent. Do not add other sections or headers—output only the expanded [${label}] section. The final output should be roughly 400 words longer than the current text.\n\nCurrent text:\n${existingText}\n\nOutput only the expanded section text; no preamble or explanation.`;
}
