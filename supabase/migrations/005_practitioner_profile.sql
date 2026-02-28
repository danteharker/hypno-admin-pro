-- Practitioner profile fields for Settings and Post Engine auto-fill
alter table public.profiles
  add column if not exists post_engine_services text,
  add column if not exists post_engine_themes text,
  add column if not exists post_engine_expertise text;
