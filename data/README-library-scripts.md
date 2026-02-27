# Adding scripts to the Library

The **Library** tab on the Scripts page shows pre-written scripts that every user can see. You can add scripts in batches.

## 1. Create the table (one-time)

In **Supabase** → **SQL Editor**, run the contents of:

`supabase/migrations/002_library_scripts.sql`

That creates the `library_scripts` table.

## 2. Add scripts via JSON

Edit **`data/library-scripts.json`**. It’s a JSON array. Each item has:

- **title** (required) – Display name of the script  
- **category** (required) – One of: `relaxation`, `anxiety`, `sleep`, `confidence`, `habits`, `weight`, `phobias`, `custom`  
- **content** (required) – Full script text. Use `\n` for new lines inside the string.  
- **tags** (optional) – Array of strings, e.g. `["beginner", "short"]`

### Example (one script)

```json
{
  "title": "Deep Relaxation Protocol",
  "category": "relaxation",
  "content": "[INDUCTION]\nSettle into a comfortable position...\n\n[DEEPENER]\n...",
  "tags": ["beginner"]
}
```

### Example (multiple scripts)

```json
[
  {
    "title": "Script One",
    "category": "relaxation",
    "content": "Full script text here..."
  },
  {
    "title": "Script Two",
    "category": "anxiety",
    "content": "Another full script..."
  }
]
```

Paste your ~20 scripts into the array (or add them to the existing array). Save the file.

## 3. Run the seed script

You need the **service role** key so the script can insert into `library_scripts`:

1. In **Supabase** → **Settings** → **API**, copy the **service_role** key (secret).  
2. Add to **`.env.local`**:  
   `SUPABASE_SERVICE_ROLE_KEY=eyJ...`  
3. In the project folder run:

```bash
npm run seed:library
```

Each run **adds** the scripts in the JSON file; it does not clear existing library scripts. To avoid duplicates, don’t put the same script in the file twice. You can run the command again whenever you add more scripts to the JSON.

## 4. In the app

- **Scripts** → **Library** tab: list of library scripts.  
- **Use script**: copies that script into **My Scripts** and opens the editor.  
- **Edit with AI**: describe the changes you want; the app generates a revised script and saves it to **My Scripts**.
