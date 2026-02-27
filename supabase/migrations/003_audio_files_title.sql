-- Add title to audio_files for display in the Audio list.
ALTER TABLE public.audio_files
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Voice track';

COMMENT ON COLUMN public.audio_files.title IS 'User-defined title for the saved track.';
