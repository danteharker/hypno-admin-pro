import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;
const SCRIPT_MODEL = process.env.OPENAI_SCRIPT_MODEL || "gpt-4o-mini";

const STYLE_RULES = `Style rules (follow exactly):
- British English spelling throughout
- Second person ("you")
- Include (Pause 3s) and (Pause 5s) directions — roughly one every 2-4 sentences
- Short paragraphs of 2-3 sentences each for easy reading during delivery
- Flowing, poetic, calming language with ellipses (...) for natural pauses
- Do NOT copy phrases or sentences from the original — this must be entirely new
- Do NOT include preamble, explanation, or word counts — output only the script text`;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Split a script into its ## sections.
 * Returns an array of { heading, body, words } objects.
 * If the script has no ## headings, returns the whole thing as one block.
 */
function parseSections(content: string): Array<{ heading: string; body: string; words: number }> {
  const lines = content.split("\n");
  const sections: Array<{ heading: string; body: string; words: number }> = [];
  let currentHeading = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentHeading || currentLines.some((l) => l.trim())) {
        const body = currentLines.join("\n").trim();
        sections.push({ heading: currentHeading, body, words: wordCount(body) });
      }
      currentHeading = line.trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  // Push the last section
  if (currentHeading || currentLines.some((l) => l.trim())) {
    const body = currentLines.join("\n").trim();
    sections.push({ heading: currentHeading, body, words: wordCount(body) });
  }

  return sections;
}

async function reimagineSection(
  heading: string,
  body: string,
  targetWords: number,
  title: string,
  theme: string
): Promise<string> {
  if (!client) throw new Error("OPENAI_API_KEY is not set.");

  const sectionLabel = heading.replace(/^##\s*/, "");
  const isTermination = /termination|awakening|emerge/i.test(sectionLabel);

  const prompt = `You are a clinical hypnotherapist reimagining the "${sectionLabel}" section of a hypnotherapy script titled "${title}" (theme: ${theme}).

Here is the original "${sectionLabel}" section for reference (do NOT copy it — use it only to understand the purpose and length):

${body}

---

Write a COMPLETELY NEW "${sectionLabel}" section. Same therapeutic purpose, entirely different metaphors, imagery, and language.

Target length: approximately ${targetWords} words. Do not stop early.
${isTermination ? "Include a count from 1 to 5 to bring the person back to full awareness." : ""}

${STYLE_RULES}

Start your output directly with the heading: ${heading}`;

  const completion = await client.chat.completions.create({
    model: SCRIPT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.85,
    max_tokens: Math.max(2000, Math.ceil(targetWords * 2)),
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export async function reimagineScript(content: string, title: string): Promise<string> {
  if (!client) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const sections = parseSections(content);

  // If no ## headings found, fall back to a single-call reimagination
  if (sections.length === 0 || (sections.length === 1 && !sections[0].heading)) {
    const total = wordCount(content);
    const completion = await client.chat.completions.create({
      model: SCRIPT_MODEL,
      messages: [
        {
          role: "user",
          content: `You are a clinical hypnotherapist. Reimagine the following hypnotherapy script titled "${title}". Same therapeutic theme, entirely new language, metaphors, and imagery. Target: ${total} words.\n\n${STYLE_RULES}\n\n---\n\n${content}`,
        },
      ],
      temperature: 0.85,
      max_tokens: 8000,
    });
    return completion.choices[0]?.message?.content?.trim() ?? "";
  }

  // Reimagine each section separately, in parallel
  const theme = title;
  const reimaginedParts = await Promise.all(
    sections.map((section) =>
      reimagineSection(section.heading, section.body, section.words, title, theme)
    )
  );

  return reimaginedParts.join("\n\n");
}
