/**
 * Seed the library_scripts table from data/library-scripts.json
 * Uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS). Run once after creating the table.
 *
 * 1. In Supabase Dashboard → Settings → API, copy the "service_role" key (secret).
 * 2. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 * 3. Run: node scripts/seed-library.js
 *
 * To add more scripts: edit data/library-scripts.json (see format below) and run again.
 * This script inserts new rows; it does not delete existing library scripts.
 */

const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  env.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key) process.env[key] = val;
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(url, key);

const dataPath = path.join(__dirname, "..", "data", "library-scripts.json");
if (!fs.existsSync(dataPath)) {
  console.error("Missing data/library-scripts.json");
  process.exit(1);
}

const items = JSON.parse(fs.readFileSync(dataPath, "utf8"));
if (!Array.isArray(items)) {
  console.error("data/library-scripts.json must be a JSON array");
  process.exit(1);
}

async function main() {
  let inserted = 0;
  for (const row of items) {
    const { title, category, content, tags } = row;
    if (!title || !category || content == null) {
      console.warn("Skipping entry missing title, category, or content:", row);
      continue;
    }
    const { error } = await supabase.from("library_scripts").insert({
      title: String(title).trim(),
      category: String(category).trim().toLowerCase(),
      content: String(content),
      tags: Array.isArray(tags) ? tags : [],
    });
    if (error) {
      console.error("Insert failed for:", title, error);
      continue;
    }
    inserted++;
    console.log("Inserted:", title);
  }
  console.log("Done. Inserted", inserted, "library scripts.");
}

main();
