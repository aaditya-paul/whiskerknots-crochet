# Supabase Local Setup Guide

This project is fully migrated to Supabase for auth, CMS products, and user state (cart/favorites).

## 1. Start Supabase locally

Install the Supabase CLI, then in the project root run:

```bash
supabase init
supabase start
```

## 2. Add local env vars

Use [env.example](env.example) as a template and create `.env.local`:

```env
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_local_publishable_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
NEXT_PUBLIC_ADMIN_EMAILS=you@example.com
```

Use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` going forward. `NEXT_PUBLIC_SUPABASE_ANON_KEY` remains supported as a fallback.

You can find local keys with:

```bash
supabase status
```

## 3. Create required tables in local Supabase

Open the SQL editor in Supabase Studio and run:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cart jsonb not null default '[]'::jsonb,
  favorites jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  category text not null,
  image text not null,
  description text not null,
  is_featured boolean not null default false,
  slug text not null unique
);
```

## 4. Recommended local RLS policies

```sql
alter table public.profiles enable row level security;
alter table public.user_state enable row level security;
alter table public.products enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_upsert_own" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "user_state_select_own" on public.user_state
for select using (auth.uid() = user_id);

create policy "user_state_upsert_own" on public.user_state
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "products_read_public" on public.products
for select using (true);

-- Restrict writes to admin users by email allowlist.
-- Replace emails below with your own admin users.
create policy "products_write_admin" on public.products
for all using (
  exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and lower(u.email) in ('admin@example.com')
  )
)
with check (
  exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and lower(u.email) in ('admin@example.com')
  )
);
```

## 5. Seed products

1. Sign in with an admin email.
2. Go to `/admin`.
3. Click `Copy Default Catalog into CMS`.

## 6. Run app

```bash
npm install
npm run dev
```
