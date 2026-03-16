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

Run migrations from this repo (recommended):

```bash
supabase db reset
```

This applies:

- `supabase/migrations/20260316000000_ecommerce_schema.sql`
- `supabase/migrations/20260317010000_reset_conflicting_product_policies.sql`
- `supabase/migrations/20260317013000_add_profiles_and_user_state.sql`

If you do not want to reset the DB, run these SQL files manually in Supabase Studio SQL Editor in the same order.

## 4. Recommended local RLS policies

For this project, use the migration-defined policies only.

Do not add `products_write_admin` policies that query `auth.users` directly from RLS expressions. Those can cause:

`[42501] permission denied for table users`

Admin access is enforced in the app via `NEXT_PUBLIC_ADMIN_EMAILS`, and DB write access for CMS tables is granted to authenticated users by migration policy.

## 5. Seed products

1. Sign in with an admin email.
2. Go to `/admin/products/new`.
3. Add categories and products through the CMS UI.

## 6. Troubleshooting

### Error: `[42501] permission denied for table users` while adding a product

Cause: old conflicting product policies still exist in your local DB.

Fix quickly:

```sql
drop policy if exists products_write_admin on public.products;
drop policy if exists products_read_public on public.products;

drop policy if exists "Auth manage products" on public.products;
create policy "Auth manage products" on public.products
  for all using (auth.role() = 'authenticated');

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products" on public.products
  for select using (status = 'active');
```

Or run:

```bash
supabase db reset
```

## 7. Run app

```bash
npm install
npm run dev
```
