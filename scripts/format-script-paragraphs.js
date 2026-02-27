/**
 * Reformat script content so every 2-3 sentences are followed by a full line break.
 * Makes scripts easier to read when delivering.
 * Usage: node scripts/format-script-paragraphs.js [slug1] [slug2] ...
 * If no slugs given, formats all scripts that have long paragraphs.
 */

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "script-library.json");

// Sentence boundary: . ? ! or ) (from "Pause 3s)") followed by space, then capital or quote
const SENTENCE_BOUNDARY = /(?<=[.!?)])\s+(?=[A-Z"])/;

function formatContent(content) {
  if (!content || typeof content !== "string") return content;
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lineBreak = "\n\n";
  const singleBreak = "\n";
  const blocks = normalized.split(/\n\n+/);

  const out = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    // Keep ## headers and short lines as-is
    if (trimmed.startsWith("##") || (trimmed.length < 120 && !trimmed.includes(". "))) {
      out.push(trimmed);
      continue;
    }
    // Strip leading/trailing quote from spoken blocks for processing
    let text = trimmed;
    let wrapQuotes = false;
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1);
      wrapQuotes = true;
    }
    const sentences = text.split(SENTENCE_BOUNDARY).map((s) => s.trim()).filter(Boolean);
    const chunks = [];
    for (let i = 0; i < sentences.length; ) {
      const take = Math.min(3, sentences.length - i);
      const chunk = sentences.slice(i, i + take).join(" ");
      chunks.push(chunk);
      i += take;
    }
    const formatted = chunks.join("\n\n");
    out.push(wrapQuotes ? '"' + formatted + '"' : formatted);
  }

  return out.join(lineBreak);
}

function main() {
  const slugs = process.argv.slice(2);
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const scripts = data.scripts || [];
  const toFormat = slugs.length ? scripts.filter((s) => slugs.includes(s.slug)) : scripts;
  let updated = 0;

  for (const script of toFormat) {
    if (!script.content) continue;
    const formatted = formatContent(script.content);
    if (formatted !== script.content) {
      script.content = formatted;
      updated++;
      console.log("Formatted:", script.slug);
    }
  }

  if (updated) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
    console.log("Updated", updated, "script(s) in data/script-library.json");
  } else {
    console.log("No changes (no matching scripts or already formatted)");
  }
}

main();
