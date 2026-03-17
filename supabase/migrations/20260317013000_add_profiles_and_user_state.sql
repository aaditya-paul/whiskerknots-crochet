-- Create user profile and per-user state tables used by AuthContext/CartContext.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cart jsonb not null default '[]'::jsonb,
  favorites jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Ensure expected columns exist even if tables were created previously.
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.user_state add column if not exists cart jsonb not null default '[]'::jsonb;
alter table public.user_state add column if not exists favorites jsonb not null default '[]'::jsonb;
alter table public.user_state add column if not exists updated_at timestamptz not null default now();

-- Reusable updated_at trigger function.
create or replace function public._set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public._set_updated_at();

drop trigger if exists trg_user_state_updated_at on public.user_state;
create trigger trg_user_state_updated_at
before update on public.user_state
for each row execute function public._set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_state enable row level security;

-- Profiles: each authenticated user can read/write only their own row.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- User state: each authenticated user can read/write only their own row.
drop policy if exists user_state_select_own on public.user_state;
create policy user_state_select_own
on public.user_state
for select
using (auth.uid() = user_id);

drop policy if exists user_state_insert_own on public.user_state;
create policy user_state_insert_own
on public.user_state
for insert
with check (auth.uid() = user_id);

drop policy if exists user_state_update_own on public.user_state;
create policy user_state_update_own
on public.user_state
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
