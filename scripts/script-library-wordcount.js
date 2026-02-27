/**
 * Script library: word counts, heading format fix, and expansion tracker.
 *
 * Usage:
 *   node scripts/script-library-wordcount.js              # report only
 *   node scripts/script-library-wordcount.js --tracker    # report + write docs/script-expansion-tracker.md
 *   node scripts/script-library-wordcount.js --fix        # replace **(Section)** with ## Section in JSON (then save)
 *   node scripts/script-library-wordcount.js --fix --write # fix and write script-library.json back
 */

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "script-library.json");
const TRACKER_PATH = path.join(__dirname, "..", "docs", "script-expansion-tracker.md");

const TARGET_WORDS = 2500;
const TOLERANCE = 100;
const MIN_WORDS = TARGET_WORDS - TOLERANCE;
const MAX_WORDS = TARGET_WORDS + TOLERANCE;

function wordCount(text) {
  if (!text || typeof text !== "string") return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Replace **(Section Name)** with ## Section Name when it's a standalone section heading
 * (not after a bullet like "- **(" or "* **(").
 */
function fixHeadingFormat(content) {
  if (!content || typeof content !== "string") return content;
  return content.replace(/(^|\n\n)\*\*\(([^)]+)\)\*\*(\n\n)/g, "$1## $2$3");
}

function hasOldHeadingFormat(content) {
  return /\n\n\*\*\([^)]+\)\*\*\n\n/.test(content);
}

function main() {
  const args = process.argv.slice(2);
  const writeTracker = args.includes("--tracker");
  const doFix = args.includes("--fix");
  const writeJson = args.includes("--write");

  const raw = fs.readFileSync(DATA_PATH, "utf8");
  const data = JSON.parse(raw);
  const scripts = data.scripts || [];

  const rows = [];
  let needsFix = false;
  const scriptsToFix = [];

  for (const script of scripts) {
    let content = script.content || "";
    const beforeFix = content;
    if (doFix && hasOldHeadingFormat(content)) {
      content = fixHeadingFormat(content);
      if (content !== beforeFix) {
        needsFix = true;
        scriptsToFix.push({ ...script, content });
      }
    }

    const count = wordCount(content);
    const ok = count >= MIN_WORDS && count <= MAX_WORDS;
    const under = count < MIN_WORDS;
    const over = count > MAX_WORDS;
    let status = ok ? "✅" : under ? "⚠️ short" : "⚠️ long";
    const formatOk = !hasOldHeadingFormat(script.content || "");

    rows.push({
      slug: script.slug,
      title: script.title,
      section: script.section,
      words: count,
      status,
      formatOk,
    });

    console.log(`${script.slug}: ${count} words ${ok ? "" : `(${status})`}${!formatOk ? " [needs format fix]" : ""}`);
  }

  if (doFix && needsFix && writeJson) {
    for (const s of scriptsToFix) {
      const idx = data.scripts.findIndex((x) => x.slug === s.slug);
      if (idx >= 0) data.scripts[idx].content = s.content;
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
    console.log("\nUpdated data/script-library.json with heading fixes.");
  } else if (doFix && needsFix && !writeJson) {
    console.log("\nUse --fix --write to apply heading fixes to script-library.json.");
  }

  if (writeTracker) {
    const lines = [
      "# Script expansion tracker",
      "",
      "Target: **2500 words** (±100). Section headings: use `## Title`, not `**(Title)**`.",
      "",
      "| Slug | Title | Section | Words | Status | Format |",
      "|------|-------|---------|-------|--------|--------|",
    ];
    for (const r of rows) {
      const fmt = r.formatOk ? "✅" : "❌";
      lines.push(`| ${r.slug} | ${r.title} | ${r.section} | ${r.words} | ${r.status} | ${fmt} |`);
    }
    const dir = path.dirname(TRACKER_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TRACKER_PATH, lines.join("\n"), "utf8");
    console.log("\nWrote " + TRACKER_PATH);
  }

  const underCount = rows.filter((r) => r.words < MIN_WORDS).length;
  const overCount = rows.filter((r) => r.words > MAX_WORDS).length;
  const okCount = rows.filter((r) => r.words >= MIN_WORDS && r.words <= MAX_WORDS).length;
  console.log("\n---");
  console.log(`Total scripts: ${rows.length}. In range: ${okCount}. Short: ${underCount}. Long: ${overCount}.`);
}

main();
