# Hypnosis script formatting rules

**Use these rules for all script content in this project** (e.g. `data/script-library.json`, or any new/expanded scripts). Cursor AI and other tooling should follow them.

---

## Paragraph breaks (easy reading for delivery)

- **2 or 3 full sentences, then a full line break.**
- Do not use long, dense paragraphs. Break after every 2–3 sentences so the person reading the script can follow and pause naturally.

**Example:**

```
You speak kindly to yourself. When you make a mistake, you respond with understanding, not blame.

You celebrate your successes, no matter how small. You learn from challenges without punishing yourself. (Pause 5s) You set healthy boundaries, because you know your worth.

You say no when you need to, and yes when it serves you.
```

- **Pause cues** like `(Pause 3s)` or `(Pause 5s)` stay with the sentence they follow; they do not start a new paragraph on their own.
- Section headings use `## Title` (e.g. `## Induction - Progressive Relaxation`), not `**(Title)**`.

---

## Applying the formatting

- Run: `node scripts/format-script-paragraphs.js [slug1] [slug2] ...`  
  Or: `npm run script-library:format-paragraphs`  
- With no slug args, all scripts in `data/script-library.json` are processed.
- Use this after writing or editing script content so the 2–3 sentence + line break rule is applied consistently.

---

## Word count and headings

- Target length per script: **~2500 words** (±100), i.e. 2400–2600 words.
- Section headings: use `## Section name` (e.g. `## Deepener - The Mirror of Truth`), not bold-in-parens like `**(Section name)**`.

See also: `docs/SCRIPT-EXPANSION-PLAN.md` for the expansion workflow.
