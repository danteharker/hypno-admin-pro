/**
 * Generate seed scripts for empty categories in the script library.
 * Generates each section separately for reliable length control.
 *
 * Usage:  node scripts/generate-seed-scripts.js [batch] [--force]
 *   batch 1 = Body Image, Childbirth, Children's Issues, Grief, Pain Relaxation
 *   batch 2 = Regression and Progression, Self Hypnosis, Sexual Issues, Skin Problems
 *   batch 3 = Deepeners, Inductions, Metaphors, Suggestibility Tests, Time Lines, Visualisations
 *   (no arg) = all batches
 *   --force  = overwrite existing scripts
 */

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const DATA_PATH = path.join(__dirname, "..", "data", "script-library.json");
const MODEL = "gpt-4o";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STYLE_RULES = `STYLE RULES (follow exactly):
- British English spelling throughout.
- Second person ("you").
- Include (Pause 3s), (Pause 5s) throughout — roughly one every 2-4 sentences.
- Break into short paragraphs of 2-3 sentences each.
- Flowing, poetic, calming language with ellipses (...) for natural pauses.
- Do NOT wrap text in quotation marks.
- Do NOT include preamble, explanation, or word counts. Output ONLY the script text.`;

const SECTION_PROMPTS = {
  induction: (spec) => `You are a clinical hypnotherapist. Write ONLY the induction section of a hypnotherapy script about "${spec.title}" (category: ${spec.section}).

This must be a progressive relaxation induction. Start with the heading: ## Induction - [Descriptive Name]

Write exactly 500 words. Cover head-to-toe (or toe-to-head) body relaxation with rich sensory detail.

${STYLE_RULES}`,

  deepener: (spec) => `You are a clinical hypnotherapist. Write ONLY the deepener section of a hypnotherapy script about "${spec.title}" (category: ${spec.section}).

Create a vivid, metaphorical deepener relevant to the theme. Start with the heading: ## Deepener - [Descriptive Name]

Write exactly 500 words. Use a single extended metaphor with rich sensory imagery.

${spec.notes}

${STYLE_RULES}`,

  therapeutic_part1: (spec) => `You are a clinical hypnotherapist. Write the FIRST HALF of the therapeutic content section of a hypnotherapy script about "${spec.title}" (category: ${spec.section}).

Start with the heading: ## Therapeutic Content

Write exactly 800 words. This first half should include:
- Direct therapeutic suggestions for change, specific to the topic
- Indirect suggestions woven through metaphor and imagery
- Acknowledging the person's current experience and validating it
- Beginning to shift perspective and introduce new patterns

${spec.notes}

${STYLE_RULES}`,

  therapeutic_part2: (spec) => `You are a clinical hypnotherapist. Write the SECOND HALF of the therapeutic content section of a hypnotherapy script about "${spec.title}" (category: ${spec.section}).

Do NOT include any heading — this continues directly from the first half.

Write exactly 800 words. This second half should include:
- Future pacing — vividly imagining positive outcomes tomorrow, next week, in months ahead (be specific and detailed with scenarios)
- Post-hypnotic suggestions — anchors and triggers the person can use in daily life
- Ego-strengthening statements reinforcing the person's capability and worth
- A strong, confident closing paragraph before the termination

${spec.notes}

${STYLE_RULES}`,

  termination: (spec) => `You are a clinical hypnotherapist. Write ONLY the termination/awakening section of a hypnotherapy script about "${spec.title}" (category: ${spec.section}).

Start with the heading: ## Termination

Write exactly 200 words. Count from 1 to 5 to bring the person back to full awareness. Reinforce the positive suggestions. End with encouragement.

${STYLE_RULES}`,
};

const COMPONENT_PROMPT_PART1 = (spec) => `You are a clinical hypnotherapist. Write the FIRST HALF of a standalone ${spec.format} script.

TITLE: ${spec.title}
CATEGORY: ${spec.section}

${spec.notes}

Write exactly 1,200 words for this first half. Be thorough and detailed. Include rich sensory imagery and plenty of (Pause 3s) and (Pause 5s) directions. Take your time — do not rush through the content.

${STYLE_RULES}`;

const COMPONENT_PROMPT_PART2 = (spec) => `You are a clinical hypnotherapist. Write the SECOND HALF of a standalone ${spec.format} script.

TITLE: ${spec.title}
CATEGORY: ${spec.section}

${spec.notes}

Do NOT repeat the ## heading — this continues directly from the first half.
Write exactly 1,200 words for this second half. Continue with rich sensory imagery, therapeutic depth, and plenty of (Pause) directions. Build to a satisfying conclusion.

${STYLE_RULES}`;

const BATCHES = {
  1: [
    {
      section: "Body Image",
      sectionId: "body-image",
      slug: "positive-body-image",
      title: "Positive Body Image",
      intro:
        "This script helps individuals develop a healthy, accepting relationship with their body. It aims to reduce negative self-judgement about physical appearance and cultivate genuine appreciation for the body's strength and capabilities.",
      notes:
        "Focus on body acceptance, letting go of comparison, appreciating what the body can do rather than how it looks. Include self-compassion. Use a mirror metaphor in the deepener where the person sees their true beauty.",
    },
    {
      section: "Childbirth",
      sectionId: "childbirth",
      slug: "calm-and-confident-birth",
      title: "Calm and Confident Birth",
      intro:
        "This script is designed for expectant mothers preparing for labour and delivery. It promotes deep relaxation, confidence in the body's natural birthing ability, and a calm, positive mindset for the birthing experience.",
      notes:
        "Use gentle, empowering language. Focus on trusting the body, managing sensations (avoid the word 'pain'), breathing through contractions (call them 'surges' or 'waves'). Include future pacing of a calm birth. Use ocean/wave metaphor in deepener.",
    },
    {
      section: "Children's Issues",
      sectionId: "childrens-issues",
      slug: "building-confidence-for-children",
      title: "Building Confidence for Children",
      intro:
        "A gentle script tailored for children aged 7-12, designed to boost self-confidence, reduce worry, and foster a sense of inner strength using age-appropriate language and vivid imagination.",
      notes:
        "Use simple, engaging language suitable for children aged 7-12. Include a fun, imaginative metaphor (e.g. a magic shield, a superhero cape, a special treasure chest). Keep sentences short. Use lots of sensory detail. Avoid complex vocabulary. Make it playful and warm.",
    },
    {
      section: "Grief",
      sectionId: "grief",
      slug: "healing-from-grief",
      title: "Healing from Grief",
      intro:
        "This script supports individuals processing grief and loss. It provides a safe, compassionate space to honour their feelings, begin the healing process, and find a sense of peace while keeping treasured memories alive.",
      notes:
        "Be very gentle and respectful. Validate all feelings of grief. Do not rush the process or suggest 'getting over it'. Use metaphors of nature (seasons changing, rivers flowing) to normalise the journey. Include a section on connecting with positive memories of the loved one. Use a garden of memories metaphor in the deepener.",
    },
    {
      section: "Pain Relaxation",
      sectionId: "pain-relaxation",
      slug: "managing-chronic-pain",
      title: "Managing Chronic Pain",
      intro:
        "This script uses hypnotic techniques to help individuals manage chronic pain. It focuses on altering the perception of discomfort, promoting deep physical relaxation, and empowering the individual with tools for ongoing pain management.",
      notes:
        "Use 'discomfort' or 'sensation' rather than 'pain' where possible. Include glove anaesthesia technique. Focus on turning down a 'dial' or 'dimmer switch' of sensation. Include post-hypnotic suggestion for ongoing relief. Be careful not to promise pain elimination — focus on management and comfort. Use a control room metaphor in the deepener.",
    },
  ],
  2: [
    {
      section: "Regression and Progression",
      sectionId: "regression-and-progression",
      slug: "exploring-past-experiences",
      title: "Exploring Past Experiences",
      intro:
        "This script guides individuals through a safe regression to earlier experiences that may be influencing present-day feelings or behaviours. It creates a secure framework for revisiting, understanding, and reframing past events.",
      notes:
        "Include strong safety protocols (safe place, protective light). Use an affect bridge or timeline approach. Include reframing of the past event. Emphasise that the person is safe, an observer, and in control at all times. Include return-to-present anchoring. Use a corridor of doors metaphor in the deepener.",
    },
    {
      section: "Self Hypnosis",
      sectionId: "self-hypnosis",
      slug: "learning-self-hypnosis",
      title: "Learning Self-Hypnosis",
      intro:
        "This script teaches individuals the fundamentals of self-hypnosis, giving them a practical tool they can use independently. It includes a simple induction method, deepening technique, and guidance on crafting and delivering their own suggestions.",
      notes:
        "This is a teaching script — walk the client through the process while they experience it. Include a simple eye-fixation or breathing induction they can replicate at home. Teach them to use a cue/anchor (e.g. pressing thumb and finger together) to enter self-hypnosis quickly. Include how to give themselves suggestions and how to emerge safely. Use a library of wisdom metaphor in the deepener.",
    },
    {
      section: "Sexual Issues",
      sectionId: "sexual-issues",
      slug: "sexual-confidence-and-wellbeing",
      title: "Sexual Confidence and Wellbeing",
      intro:
        "This script addresses common concerns around sexual confidence and intimacy. It promotes relaxation, self-acceptance, and a positive relationship with one's own body and sexuality in a tasteful, professional manner.",
      notes:
        "Keep language professional, clinical yet warm. Focus on relaxation, letting go of performance anxiety, being present in the moment, self-acceptance, and connection. Do not be explicit. Focus on emotional connection, confidence, releasing tension or worry, and enjoying intimacy as a natural part of life. Use a warm, safe space metaphor in the deepener.",
    },
    {
      section: "Skin Problems",
      sectionId: "skin-problems",
      slug: "calm-and-healing-skin",
      title: "Calm and Healing Skin",
      intro:
        "This script supports individuals dealing with stress-related skin conditions such as eczema, psoriasis, or acne. It uses mind-body techniques to promote calm, reduce the stress response, and encourage the body's natural healing processes.",
      notes:
        "Use cooling, soothing imagery. Include visualisation of healing light or cooling water flowing gently over the skin. Address the stress-skin connection. Include suggestions for reduced itching and irritation. Do not promise a cure — focus on supporting the body's natural healing ability. Use a healing waterfall metaphor in the deepener.",
    },
  ],
  3: [
    {
      section: "Deepeners",
      sectionId: "deepeners",
      slug: "staircase-deepener",
      title: "Staircase Deepener",
      intro:
        "A classic deepening technique using the imagery of descending a beautiful staircase. Each step takes the individual deeper into a state of profound relaxation and receptivity.",
      notes:
        "This is ONLY a deepener — no induction, no therapeutic content, no termination. Format with just one heading: ## Deepener - The Descending Staircase. Count down from 10 to 1 with rich sensory detail at each step. Describe the surroundings, textures, colours, light, temperature at each step.",
      format: "deepener",
    },
    {
      section: "Inductions",
      sectionId: "inductions",
      slug: "eye-fixation-induction",
      title: "Eye Fixation Induction",
      intro:
        "A traditional eye-fixation induction technique where the individual focuses on a single point until their eyes naturally tire and close, leading them into a comfortable state of hypnotic relaxation.",
      notes:
        "This is ONLY an induction — no deepener, no therapeutic content, no termination. Format with just one heading: ## Induction - Eye Fixation. Include detailed eye-fixation instructions, suggestions of eye fatigue and heaviness, eyelid flutter, and the transition into comfortable closure and relaxation. Be very thorough and detailed.",
      format: "induction",
    },
    {
      section: "Metaphors",
      sectionId: "metaphors",
      slug: "the-garden-of-the-mind",
      title: "The Garden of the Mind",
      intro:
        "A versatile therapeutic metaphor using the imagery of a neglected garden being restored and nurtured. Suitable for themes of personal growth, letting go of the past, and cultivating new possibilities.",
      notes:
        "This is a standalone metaphor that can be inserted into any script. Format with just one heading: ## Metaphor - The Garden of the Mind. Include rich, detailed garden imagery — finding the neglected garden, clearing weeds (old patterns), preparing the soil, planting new seeds (new beliefs), watering and nurturing them, watching them grow and bloom.",
      format: "metaphor",
    },
    {
      section: "Suggestibility Tests",
      sectionId: "suggestibility-tests",
      slug: "hand-clasp-suggestibility-test",
      title: "Hand Clasp Suggestibility Test",
      intro:
        "A classic suggestibility test using the hand clasp technique. This test helps the therapist gauge the client's responsiveness to suggestion before beginning the main hypnotic work.",
      notes:
        "This is ONLY a suggestibility test. Format with just one heading: ## Suggestibility Test - Hand Clasp. Include the full script: instructions to clasp hands tightly, suggestions for the fingers locking and stiffening, challenge to try to pull them apart, the release, and reassurance. Also include a section with notes for the therapist on interpreting results.",
      format: "suggestibility-test",
    },
    {
      section: "Time Lines",
      sectionId: "time-lines",
      slug: "timeline-therapy-technique",
      title: "Timeline Therapy Technique",
      intro:
        "A time line therapy script that guides the individual to float above their personal timeline, allowing them to release negative emotions attached to past events and set positive expectations for the future.",
      notes:
        "This is a time line therapy technique. Format with just one heading: ## Time Line Technique - Releasing the Past. Include: establishing the timeline, floating up above it, going back along the timeline to before the first event, releasing the emotion, learning the lesson, coming forward through the timeline collecting positive learnings, arriving at the present, future pacing. Include safety protocols throughout.",
      format: "timeline",
    },
    {
      section: "Visualisations",
      sectionId: "visualisations",
      slug: "peaceful-beach-visualisation",
      title: "Peaceful Beach Visualisation",
      intro:
        "A richly detailed guided visualisation transporting the individual to a beautiful, peaceful beach. This visualisation promotes deep relaxation and can be used as a standalone relaxation exercise or inserted into longer scripts.",
      notes:
        "This is a standalone visualisation. Format with just one heading: ## Visualisation - The Peaceful Beach. Include all five senses in vivid detail — the sight of the sparkling ocean, the sound of waves and seagulls, the feel of warm sand between the toes, the smell of sea air and salt, the taste of fresh clean air. Include walking along the shore, sitting down, watching the sunset.",
      format: "visualisation",
    },
  ],
};

async function callAI(prompt) {
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4000,
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

async function generateFullScript(spec) {
  console.log(`  Generating "${spec.title}" in 5 sections...`);
  const start = Date.now();

  const sections = ["induction", "deepener", "therapeutic_part1", "therapeutic_part2", "termination"];
  const parts = [];

  for (const section of sections) {
    const prompt = SECTION_PROMPTS[section](spec);
    process.stdout.write(`    ${section}... `);
    const sectionStart = Date.now();
    const text = await callAI(prompt);
    const words = text.split(/\s+/).filter(Boolean).length;
    const elapsed = ((Date.now() - sectionStart) / 1000).toFixed(1);
    console.log(`${words} words (${elapsed}s)`);
    parts.push(text);
  }

  const content = parts.join("\n\n");
  const totalWords = content.split(/\s+/).filter(Boolean).length;
  const totalElapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`  Total: ${totalWords} words (${totalElapsed}s)`);
  return content;
}

async function generateComponentScript(spec) {
  console.log(`  Generating "${spec.title}" (${spec.format}) in 2 parts...`);
  const start = Date.now();

  process.stdout.write(`    part1... `);
  const s1 = Date.now();
  const part1 = await callAI(COMPONENT_PROMPT_PART1(spec));
  const w1 = part1.split(/\s+/).filter(Boolean).length;
  console.log(`${w1} words (${((Date.now() - s1) / 1000).toFixed(1)}s)`);

  process.stdout.write(`    part2... `);
  const s2 = Date.now();
  const part2 = await callAI(COMPONENT_PROMPT_PART2(spec));
  const w2 = part2.split(/\s+/).filter(Boolean).length;
  console.log(`${w2} words (${((Date.now() - s2) / 1000).toFixed(1)}s)`);

  const content = part1 + "\n\n" + part2;
  const totalWords = content.split(/\s+/).filter(Boolean).length;
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`  Total: ${totalWords} words (${elapsed}s)`);
  return content;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const batchArgs = args.filter((a) => a !== "--force");
  const batchNums = batchArgs.length
    ? batchArgs.map((a) => parseInt(a, 10))
    : [1, 2, 3];

  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

  for (const batchNum of batchNums) {
    const specs = BATCHES[batchNum];
    if (!specs) {
      console.error(`Unknown batch: ${batchNum}`);
      continue;
    }

    console.log(`\n=== BATCH ${batchNum} (${specs.length} scripts) ===\n`);

    for (const spec of specs) {
      const existingIdx = data.scripts.findIndex((s) => s.slug === spec.slug);
      if (existingIdx !== -1 && !force) {
        console.log(`  Skipping "${spec.title}" — already exists (use --force to overwrite)`);
        continue;
      }
      if (existingIdx !== -1) {
        data.scripts.splice(existingIdx, 1);
      }

      const content = spec.format
        ? await generateComponentScript(spec)
        : await generateFullScript(spec);

      data.scripts.push({
        slug: spec.slug,
        title: spec.title,
        section: spec.section,
        introduction: spec.intro,
        content,
      });

      const section = data.sections.find((s) => s.id === spec.sectionId);
      if (section && !section.scriptSlugs.includes(spec.slug)) {
        section.scriptSlugs.push(spec.slug);
      }

      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
      console.log(`  Saved to script-library.json\n`);
    }
  }

  console.log("\nAll done! Run: node scripts/format-script-paragraphs.js");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
