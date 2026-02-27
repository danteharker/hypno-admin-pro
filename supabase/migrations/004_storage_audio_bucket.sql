-- Create storage bucket for saved voice tracks (Audio list).
-- If this fails (e.g. no storage schema), create bucket "audio" in Supabase Dashboard → Storage.

insert into storage.buckets (id, name, public)
values ('audio', 'audio', false)
on conflict (id) do nothing;

-- Users can read/write only their own files (path prefix = user id).
create policy "Users can read own audio"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload own audio"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own audio"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own audio"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
