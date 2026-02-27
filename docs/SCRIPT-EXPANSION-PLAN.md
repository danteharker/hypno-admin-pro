# Script expansion – how it’s managed

**Goal:** 39 scripts in `data/script-library.json` → each **~2500 words** (±100), with **section headings** instead of `**(Section Name)**`.

---

## 1. Single source of truth

- **File:** `data/script-library.json`
- All edits go here. Each script has: `slug`, `title`, `section`, `introduction`, `content`.

---

## 2. Two types of work

| Step | What | How |
|------|------|-----|
| **A. Formatting** | Replace `**(Induction - Progressive Relaxation)**` (and similar) with a proper **heading**. | One-off automated pass. Use `## Induction - Progressive Relaxation` so it’s a clear heading (not bullet points). |
| **B. Length** | Expand each script’s `content` to ~2500 words (±100). | Per script: edit (or AI-expand), then check word count with the helper script. |

**Heading rule:** Only change when it’s a **standalone section title**. Leave `**(...)**` unchanged when it’s part of a bullet list (e.g. `- **(Point one)**`).

---

## 3. Tracking

- Run the helper script to **report word counts** and (optionally) **update the tracker**.
- **Tracker file:** `docs/script-expansion-tracker.md` (generated/updated by the script).
- For each script it shows: slug, title, current word count, target 2500 (±100), status (e.g. ✅ / ⚠️ / ❌), and whether formatting is fixed.

You (or the AI) work through the list; after editing a script, run the script again to refresh counts and the tracker.

---

## 4. Suggested order of operations

1. **Back up** `data/script-library.json`.
2. **Run format fix** (helper script) once → all `**(Section)**` → `## Section` (except inside bullet lists).
3. **Generate tracker** → open `docs/script-expansion-tracker.md`, see which scripts are short.
4. **Expand in batches** (e.g. 5 scripts per session):
   - Pick a script from the tracker (e.g. “⚠️ under length”).
   - Expand the script (keep Induction, Deepener, Therapeutic Content, Termination; add pacing, imagery, suggestions to reach ~2500 words).
   - Paste updated `content` into the JSON (or use the app if it edits this file).
   - Run the helper script again → confirm word count 2400–2600 and update tracker.
5. Repeat until all scripts are ✅.

---

## 5. Word count and formatting

- **Word count** = split on spaces (and newlines), count non-empty tokens. Don’t count the JSON/metadata, only the script `content`.
- **Target:** 2400–2600 words per script (2500 ±100).
- **Formatting:** Section titles as `## Title`; leave bullet lists that use `**(...)**` as they are (or we can refine the rule if you prefer).

---

## 6. Files involved

| File | Purpose |
|------|--------|
| `data/script-library.json` | Single source; all script content lives here. |
| `scripts/script-library-wordcount.js` | Count words, fix headings, (optional) write tracker. |
| `docs/script-expansion-tracker.md` | Checklist of scripts with count and status. |
| `docs/SCRIPT-EXPANSION-PLAN.md` | This plan. |

Once you’re happy with this flow, we can do Step 2 (format fix) and generate the tracker so you can start expanding.
