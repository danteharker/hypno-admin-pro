-- Hypno Admin Pro: subscription and usage tracking for Stripe trial/paywall.
-- Run in Supabase Dashboard → SQL Editor after 001-005.

-- =============================================================================
-- PROFILES: add subscription columns
-- =============================================================================
alter table public.profiles
  add column if not exists subscription_status text default 'incomplete',
  add column if not exists trial_starts_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

-- =============================================================================
-- USAGE_TRACKING (trial usage caps: script_generation, audio_generation, ai_tool)
-- =============================================================================
create table if not exists public.usage_tracking (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_type text not null,
  created_at timestamptz default now()
);

alter table public.usage_tracking enable row level security;

create policy "Users can insert own usage"
  on public.usage_tracking for insert
  with check (auth.uid() = user_id);

create policy "Users can select own usage"
  on public.usage_tracking for select
  using (auth.uid() = user_id);

create index if not exists usage_tracking_user_id_usage_type_idx
  on public.usage_tracking(user_id, usage_type);
