/**
 * Injects expanded script content from text files into script-library.json.
 * Usage: node scripts/inject-expanded-batch.js [--batch 1|2] [slug1] [slug2] ...
 * If no slugs given, reads all .txt files from the batch folder. --batch 2 = expanded-batch2, --batch 3 = expanded-batch3.
 */

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "script-library.json");

function wordCount(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

function main() {
  const args = process.argv.slice(2);
  const batchIdx = args.indexOf("--batch");
  const batchArg = batchIdx >= 0 ? args[batchIdx + 1] : "1";
  const batchNum = ["1", "2", "3", "4", "5", "6"].includes(batchArg) ? batchArg : "1";
  const slugs = args.filter((a) => a !== "--batch" && a !== batchArg);
  const BATCH_DIR = path.join(__dirname, "..", "docs", "expanded-batch" + batchNum);

  let toInject = slugs.length
    ? slugs.map((s) => ({ slug: s.replace(/\.txt$/, ""), path: path.join(BATCH_DIR, s.replace(/\.txt$/, "") + ".txt") }))
    : fs.existsSync(BATCH_DIR)
      ? fs.readdirSync(BATCH_DIR)
          .filter((f) => f.endsWith(".txt"))
          .map((f) => ({ slug: f.replace(/\.txt$/, ""), path: path.join(BATCH_DIR, f) }))
      : [];

  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const scripts = data.scripts || [];
  let updated = 0;

  for (const { slug, path: filePath } of toInject) {
    if (!fs.existsSync(filePath)) {
      console.warn("Skip (missing):", filePath);
      continue;
    }
    const content = fs.readFileSync(filePath, "utf8").trim();
    const count = wordCount(content);
    const script = scripts.find((s) => s.slug === slug);
    if (!script) {
      console.warn("Skip (no script):", slug);
      continue;
    }
    script.content = content;
    updated++;
    console.log(slug + ": " + count + " words " + (count >= 2400 && count <= 2600 ? "✅" : "⚠️"));
  }

  if (updated) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
    console.log("Updated " + updated + " script(s) in data/script-library.json");
  }
}

main();
