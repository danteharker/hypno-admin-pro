# One-time setup: Audio storage bucket

The Audio feature (save voice tracks to “Your audio” list) stores MP3s in Supabase Storage. You create **one bucket** per project, once. All users’ files go in that bucket; access is controlled by folder (`user_id/...`) and RLS policies.

## Step-by-step (Supabase Dashboard)

1. **Open your project**  
   Go to [supabase.com/dashboard](https://supabase.com/dashboard) and open the Hypno Admin Pro project.

2. **Go to Storage**  
   In the left sidebar, click **Storage**.

3. **Create the bucket**  
   - Click **New bucket**.  
   - **Name:** `audio` (must be exactly this).  
   - **Public bucket:** leave **off** (private).  
   - Click **Create bucket**.

4. **Add policies (so users only access their own files)**  
   - In Storage, open the **Policies** tab (or click the **audio** bucket then **Policies**).  
   - Click **New policy**.  
   - Choose **For full customization** (or use the template “Allow authenticated users to upload” and adjust).  
   - Create these four policies (replace with your bucket id if different):

   **Policy 1 – Select (read)**  
   - Policy name: `Users can read own audio`  
   - Allowed operation: **SELECT**  
   - Target roles: `authenticated`  
   - USING expression:
     ```sql
     bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text
     ```

   **Policy 2 – Insert (upload)**  
   - Policy name: `Users can upload own audio`  
   - Allowed operation: **INSERT**  
   - Target roles: `authenticated`  
   - WITH CHECK expression:
     ```sql
     bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text
     ```

   **Policy 3 – Update**  
   - Policy name: `Users can update own audio`  
   - Allowed operation: **UPDATE**  
   - Target roles: `authenticated`  
   - USING expression:
     ```sql
     bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text
     ```

   **Policy 4 – Delete**  
   - Policy name: `Users can delete own audio`  
   - Allowed operation: **DELETE**  
   - Target roles: `authenticated`  
   - USING expression:
     ```sql
     bucket_id = 'audio' AND (storage.foldername(name))[1] = auth.uid()::text
     ```

5. **Done**  
   Users can now save voice tracks; files are stored under `audio/{user_id}/{id}.mp3` and only that user can read/update/delete them.

## Alternative: run the migration (SQL)

If your Supabase project already has the `storage` schema, you can run the migration instead of creating the bucket and policies by hand:

- In Dashboard → **SQL Editor**, run the contents of  
  `supabase/migrations/004_storage_audio_bucket.sql`  
  That script creates the `audio` bucket (if it doesn’t exist) and the four policies above.

After this one-time setup, no further bucket setup is needed for you or your users.
