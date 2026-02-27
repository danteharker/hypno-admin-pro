/**
 * Parses the 3 combined hypnosis script MD files and outputs data/script-library.json
 * for the app's script library menu and script pages.
 * Run: node scripts/parse-script-library.js
 */

const fs = require("fs");
const path = require("path");

const SCRIPTS_DIR = path.join(__dirname, "..", "scripts");
const FILES = [
  "combined_hypnosis_scripts1.md",
  "combined_hypnosis_scripts_batch_2.md",
  "combined_hypnosis_scripts_batch_3.md",
];
const OUT_PATH = path.join(__dirname, "..", "data", "script-library.json");

/**
 * Topic sections (at least one script each where we have content).
 * Each script slug appears in exactly one section (no repeats).
 * Sections with no slugs are placeholders for future scripts.
 */
const TOPIC_SECTION_ORDER = [
  "Addictions",
  "Anger Management",
  "Body Image",
  "Business Skills and Finance",
  "Childbirth",
  "Children's Issues",
  "Confidence",
  "Coping with Loss",
  "Exams",
  "Fears and Phobias",
  "Grief",
  "Habits and Disorders",
  "Health",
  "Memory and Learning",
  "Pain Relaxation",
  "Performance",
  "Personal Development",
  "Psychic and Paranormal",
  "Regression and Progression",
  "Relationships",
  "Resources",
  "Self Hypnosis",
  "Sexual Issues",
  "Skin Problems",
  "Sports Improvement",
  "Stress and Anxiety",
  "Weight Loss and Weight Gain",
];

const TECHNIQUE_SECTION_ORDER = [
  "Deepeners",
  "Inductions",
  "Metaphors",
  "Suggestibility Tests",
  "Time Lines",
  "Visualisations",
];

/** Script slug -> section name (one section per script, unique). */
const SCRIPT_TO_SECTION = {
  "smoking-cessation": "Addictions",
  "overcoming-anger": "Anger Management",
  "sales-confidence-and-persuasion": "Business Skills and Finance",
  "decision-making-clarity": "Business Skills and Finance",
  "boosting-self-esteem": "Confidence",
  "overcoming-shyness": "Confidence",
  "coping-with-grief-and-loss": "Coping with Loss",
  "enhanced-focus-and-concentration": "Exams",
  "overcoming-fear-of-flying": "Fears and Phobias",
  "breaking-bad-habits": "Habits and Disorders",
  "building-new-habits": "Habits and Disorders",
  "conquering-insomnia": "Health",
  "healthy-eating-habits": "Health",
  "enhanced-memory-recall": "Memory and Learning",
  "peak-performance-mindset": "Performance",
  "goal-setting-and-achievement": "Performance",
  "effective-time-management": "Performance",
  "positive-thinking": "Personal Development",
  "overcoming-self-doubt": "Personal Development",
  "cultivating-patience": "Personal Development",
  "developing-self-compassion": "Personal Development",
  "overcoming-procrastination": "Personal Development",
  "overcoming-perfectionism": "Personal Development",
  "releasing-guilt-and-shame": "Personal Development",
  "cultivating-joy": "Personal Development",
  "enhancing-creativity": "Personal Development",
  "developing-intuition": "Psychic and Paranormal",
  "cultivating-empathy": "Relationships",
  "inner-strength-and-resilience": "Resources",
  "motivation-for-exercise": "Sports Improvement",
  "managing-anxiety": "Stress and Anxiety",
  "inner-peace-and-calm": "Stress and Anxiety",
  "managing-overwhelm": "Stress and Anxiety",
  "weight-management": "Weight Loss and Weight Gain",
  "mindful-eating": "Weight Loss and Weight Gain",
};

function slug(title) {
  return title
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseToc(content) {
  const sections = [];
  let inToc = false;
  let currentSection = null;
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h3 = line.match(/^### (.+)$/);
    const link = line.match(/^\*?\s*\[([^\]]+)\]\(#[-a-z0-9]+\)/i);
    if (h3) {
      inToc = true;
      currentSection = { name: h3[1].trim(), titles: [] };
      sections.push(currentSection);
    } else if (inToc && link && currentSection) {
      currentSection.titles.push(link[1].trim());
    } else if (inToc && line.startsWith("---")) {
      break;
    }
  }
  return sections;
}

function parseScriptBlocks(content) {
  const blocks = content.split(/\n---\s*\n/);
  const scripts = [];
  for (const block of blocks) {
    const match = block.match(/^# ([^\n]+)\n\n## Introduction\n\n([\s\S]*?)\n\n## Script\n\n([\s\S]*)$/);
    if (!match) continue;
    const [, title, introduction, scriptContent] = match;
    const t = title.trim();
    if (!t || t === "Comprehensive Hypnosis Script Library" || t.startsWith("Hypnosis Script Library")) continue;
    scripts.push({
      title: t,
      introduction: introduction.trim(),
      content: scriptContent.trim(),
    });
  }
  return scripts;
}

function parseFile(filename) {
  const filepath = path.join(SCRIPTS_DIR, filename);
  if (!fs.existsSync(filepath)) {
    console.warn("Missing:", filepath);
    return { sections: [], scripts: [] };
  }
  const content = fs.readFileSync(filepath, "utf8");
  const sections = parseToc(content);
  const scriptBlocks = parseScriptBlocks(content);
  const titleToScript = new Map();
  for (const s of scriptBlocks) titleToScript.set(s.title, s);
  const seenTitles = new Set();
  const sectionsWithScripts = [];
  for (const sec of sections) {
    const scriptsInSection = [];
    for (const title of sec.titles) {
      if (seenTitles.has(title)) continue;
      const script = titleToScript.get(title);
      if (script) {
        seenTitles.add(title);
        scriptsInSection.push(script);
      }
    }
    if (scriptsInSection.length) {
      sectionsWithScripts.push({ name: sec.name, scripts: scriptsInSection });
    }
  }
  return sectionsWithScripts;
}

function main() {
  const allSectionsByName = new Map();
  const allScriptsBySlug = new Map();

  for (const file of FILES) {
    const sectionsWithScripts = parseFile(file);
    for (const { name, scripts } of sectionsWithScripts) {
      for (const script of scripts) {
        const s = slug(script.title);
        if (allScriptsBySlug.has(s)) continue;
        allScriptsBySlug.set(s, {
          slug: s,
          title: script.title,
          section: name,
          introduction: script.introduction,
          content: script.content,
        });
        if (!allSectionsByName.has(name)) {
          allSectionsByName.set(name, []);
        }
        allSectionsByName.get(name).push(s);
      }
    }
  }

  // Build section -> script slugs from our category mapping (one script per section, no repeats)
  const sectionToSlugs = new Map();
  for (const name of TOPIC_SECTION_ORDER) sectionToSlugs.set(name, []);
  for (const name of TECHNIQUE_SECTION_ORDER) sectionToSlugs.set(name, []);
  for (const [scriptSlug, sectionName] of Object.entries(SCRIPT_TO_SECTION)) {
    if (!allScriptsBySlug.has(scriptSlug)) continue;
    if (!sectionToSlugs.has(sectionName)) sectionToSlugs.set(sectionName, []);
    sectionToSlugs.get(sectionName).push(scriptSlug);
  }

  const sections = [];
  for (const name of [...TOPIC_SECTION_ORDER, ...TECHNIQUE_SECTION_ORDER]) {
    const scriptSlugs = sectionToSlugs.get(name) || [];
    sections.push({ id: slug(name), name, scriptSlugs });
  }

  // Update each script's section field to its new category
  for (const [scriptSlug, sectionName] of Object.entries(SCRIPT_TO_SECTION)) {
    const s = allScriptsBySlug.get(scriptSlug);
    if (s) s.section = sectionName;
  }

  const scripts = Array.from(allScriptsBySlug.values());
  const output = { sections, scripts };
  const outDir = path.dirname(OUT_PATH);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), "utf8");
  console.log("Wrote", OUT_PATH);
  console.log("Sections:", sections.length);
  console.log("Scripts:", scripts.length);
}

main();
