-- Add email to profiles for Payment Link webhook lookup (match by customer email).
alter table public.profiles
  add column if not exists email text;

-- Backfill from auth.users (run once). Use lower() for consistent lookup.
update public.profiles p
  set email = lower(u.email)
  from auth.users u
  where p.id = u.id and (p.email is null or p.email <> lower(u.email));

-- Keep email in sync when user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    lower(new.email)
  );
  return new;
end;
$$;
