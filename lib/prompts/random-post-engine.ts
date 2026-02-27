/** Random Post Engine: services + themes + expertise + platform → ready-to-use social content. */

export type Platform = "x" | "facebook" | "linkedin" | "blog";

const PLATFORM_RULES: Record<Platform, string> = {
  x: `- You are writing for X (formerly Twitter).
- Generate exactly 3 tweets.
- Each tweet MUST be 280 characters or fewer including hashtags — count carefully.
- Write punchy, direct, and engaging one-liners or very short paragraphs.
- Include 2–3 relevant hashtags within the 280-character limit.
- Use ## Tweet 1, ## Tweet 2, ## Tweet 3 as headings.
- Write the tweet text as a single paragraph beneath each heading — no bullet points.
- No preamble before the first heading.`,

  facebook: `- You are writing for Facebook.
- Generate exactly 3 posts.
- Each post should be 80–150 words — warm, conversational, and relatable.
- Use short paragraphs with a blank line between each paragraph so the post is easy to read (no long, unbroken chunks of text). Two to four short paragraphs per post is ideal.
- Include a soft call-to-action in at least one post (e.g. "Drop a comment", "Send me a message", "Book a free chat").
- Include 3–5 relevant hashtags at the end of each post on a new line.
- Vary the style: one educational, one personal/story-based, one offer or call-to-action focused.
- Use ## Post 1, ## Post 2, ## Post 3 as headings.
- Write post text as plain paragraphs beneath each heading, with a blank line between paragraphs.
- No preamble before the first heading.`,

  linkedin: `- You are writing for LinkedIn.
- Generate exactly 3 posts.
- Each post should be 100–200 words — professional, insightful, and credible.
- Use short paragraphs and line breaks for readability (LinkedIn renders blank lines as spacing).
- Include a question or call-to-action at the end of each post to encourage engagement.
- Include 3–5 relevant hashtags at the end of each post on a new line.
- Vary the style: one thought-leadership piece, one personal professional story, one practical tip or insight.
- Use ## Post 1, ## Post 2, ## Post 3 as headings.
- Write post text as plain paragraphs beneath each heading.
- No preamble before the first heading.`,

  blog: `- You are generating blog post ideas for a hypnotherapist's website or newsletter.
- Generate exactly 3 blog post ideas.
- For each idea, provide:
  1. A compelling blog title (use **bold**).
  2. A 2–3 sentence outline covering: the hook/opening angle, the main point the post will make, and a call-to-action or conclusion.
- The ideas should be practical, SEO-friendly, and position the therapist as an expert.
- Use ## Blog Idea 1, ## Blog Idea 2, ## Blog Idea 3 as headings.
- No preamble before the first heading.`,
};

const BASE_SYSTEM_PROMPT = `You are a social media and content copywriter who specialises in helping hypnotherapists and wellness practitioners grow their audience online.

Rules that always apply:
- Write in British English throughout (e.g. practise, realise, colour, wellbeing, behaviour).
- No placeholder text — all content must be ready to use immediately.
- Do not add explanatory notes or labels outside the post content itself.

Platform-specific rules:`;

export function buildSystemPrompt(platform: Platform): string {
  return `${BASE_SYSTEM_PROMPT}\n${PLATFORM_RULES[platform]}`;
}

export function buildRandomPostEngineUserPrompt(
  services: string,
  themes: string,
  expertise: string,
  platform: Platform,
  link?: string
): string {
  const platformLabel: Record<Platform, string> = {
    x: "X (Twitter)",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    blog: "a blog / newsletter",
  };

  const linkBlock = link?.trim()
    ? `

Website or social link to include where useful: ${link.trim()}
- Weave this into calls-to-action where it fits naturally (e.g. "Book a free chat at [link]", "Visit [link]", "Find out more: [link]").
- For X/Twitter, the link counts toward the 280-character limit — include it in at most 1–2 tweets if it fits; otherwise omit.`
    : "";

  return `Generate content for ${platformLabel[platform]} for a hypnotherapist with the following details:

Services offered: ${services.trim()}

Themes / topics: ${themes.trim()}

Areas of expertise: ${expertise.trim()}${linkBlock}

Follow the platform rules exactly. All content must be ready to copy-paste immediately.`;
}
