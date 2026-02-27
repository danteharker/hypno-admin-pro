-- Hypno Admin Pro: initial schema for profiles, scripts, clients, sessions, and related tables.
-- Run this entire file once in Supabase Dashboard → SQL Editor → New query.

-- Enable UUID extension if not already
create extension if not exists "uuid-ossp";

-- =============================================================================
-- PROFILES (one per auth user, created on signup)
-- =============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- SCRIPTS (saved scripts per user)
-- =============================================================================
create table public.scripts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text default '',
  category text,
  tags text[] default '{}',
  is_favourite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.scripts enable row level security;

create policy "Users can manage own scripts"
  on public.scripts for all
  using (auth.uid() = user_id);

create index scripts_user_id_idx on public.scripts(user_id);
create index scripts_updated_at_idx on public.scripts(updated_at desc);

-- =============================================================================
-- CLIENTS (therapist's client list)
-- =============================================================================
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  notes text,
  presenting_issues text,
  archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.clients enable row level security;

create policy "Users can manage own clients"
  on public.clients for all
  using (auth.uid() = user_id);

create index clients_user_id_idx on public.clients(user_id);

-- =============================================================================
-- SESSIONS (session log per client)
-- =============================================================================
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null,
  session_type text,
  notes text,
  scripts_used jsonb default '[]',
  created_at timestamptz default now()
);

alter table public.sessions enable row level security;

create policy "Users can manage own sessions"
  on public.sessions for all
  using (auth.uid() = user_id);

create index sessions_client_id_idx on public.sessions(client_id);
create index sessions_user_id_idx on public.sessions(user_id);

-- =============================================================================
-- SCRIPT_TEMPLATES (curated prompts for AI – Phase 2; seed data later)
-- =============================================================================
create table public.script_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  system_prompt text not null,
  questionnaire_schema jsonb default '{}',
  created_at timestamptz default now()
);

alter table public.script_templates enable row level security;

-- Read-only for authenticated users (templates are global)
create policy "Authenticated users can read script templates"
  on public.script_templates for select
  to authenticated
  using (true);

-- =============================================================================
-- AUDIO_FILES (generated audio linked to scripts – Phase 3)
-- =============================================================================
create table public.audio_files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  script_id uuid references public.scripts(id) on delete set null,
  file_path text not null,
  duration_seconds int,
  created_at timestamptz default now()
);

alter table public.audio_files enable row level security;

create policy "Users can manage own audio files"
  on public.audio_files for all
  using (auth.uid() = user_id);

create index audio_files_user_id_idx on public.audio_files(user_id);

-- =============================================================================
-- AMBIENT_PRESETS (saved ambient mixes – Phase 3)
-- =============================================================================
create table public.ambient_presets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  layers jsonb default '[]',
  created_at timestamptz default now()
);

alter table public.ambient_presets enable row level security;

create policy "Users can manage own ambient presets"
  on public.ambient_presets for all
  using (auth.uid() = user_id);

-- =============================================================================
-- SHARED_RESOURCES (client sharing – Phase 6)
-- =============================================================================
create table public.shared_resources (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  resource_type text not null,
  file_path text,
  token text not null unique,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table public.shared_resources enable row level security;

create policy "Users can manage own shared resources"
  on public.shared_resources for all
  using (auth.uid() = user_id);

create index shared_resources_token_idx on public.shared_resources(token);

-- =============================================================================
-- DONE
-- =============================================================================
-- After running, sign up / log in will work and a row will appear in profiles.
-- Scripts, clients, and other tables are ready for Phase 2+.
