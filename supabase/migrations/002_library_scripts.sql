-- Starter script library: pre-written scripts visible to all authenticated users.
-- Run this in Supabase SQL Editor after 001_initial_schema.sql.

create table public.library_scripts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null default '',
  category text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

alter table public.library_scripts enable row level security;

create policy "Authenticated users can read library scripts"
  on public.library_scripts for select
  to authenticated
  using (true);

create index library_scripts_category_idx on public.library_scripts(category);
