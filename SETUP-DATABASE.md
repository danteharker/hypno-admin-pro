# Set up the database (one-time)

This links your Hypno Admin Pro app to Supabase so sign-up, login, and data (scripts, clients, etc.) work.

## 1. Open the SQL in your project

In your project folder, open:

**`supabase/migrations/001_initial_schema.sql`**

Select all the text and copy it (Ctrl+A, then Ctrl+C).

## 2. Run it in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**.
4. Paste the full contents of `001_initial_schema.sql` into the editor.
5. Click **Run** (or press Ctrl+Enter).

You should see a success message and no errors.

## 3. Confirm

- In the left sidebar, open **Table Editor**. You should see tables: `profiles`, `scripts`, `clients`, `sessions`, `script_templates`, `audio_files`, `ambient_presets`, `shared_resources`.
- Restart your app if it’s running (`npm run dev`), then sign up or log in. After sign-up, a row will appear in `profiles`.

That’s it. Auth and database are ready for the app.
