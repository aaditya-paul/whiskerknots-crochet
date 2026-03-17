# Supabase Cloud Migration Guide

This guide explains how to move this project from local Supabase to a hosted Supabase project.

It is written for this repo specifically:

- local schema comes from the SQL migrations in `supabase/migrations/`
- the app expects `NEXT_PUBLIC_SUPABASE_URL`
- the app expects `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_ADMIN_EMAILS` controls admin UI write access
- product images are stored in the `product-media` bucket

## What Should Be Migrated

For this project, cloud migration usually means moving these parts:

1. Database schema and RLS policies
2. Database data such as categories, products, product images metadata, product variants, profiles, and user state
3. Storage bucket configuration and uploaded files
4. Auth configuration and allowed redirect URLs
5. App environment variables

## Recommended Order

Use this order to avoid partial setup problems:

1. Create the cloud Supabase project
2. Link the local repo to the cloud project
3. Push schema and policies
4. Create storage buckets in cloud
5. Migrate data if you want existing local content copied
6. Update app environment variables
7. Verify auth, CMS, storefront, and uploads

## 1. Create the Cloud Project

In the Supabase dashboard:

1. Create a new project
2. Choose region, org, database password, and project name
3. Wait for the project to finish provisioning

After that, collect these values from Project Settings:

- Project URL
- Publishable key
- Service role key

The app only needs the Project URL and Publishable key on the client side.

## 2. Log In and Link the Repo

From the project root:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

You can find the project ref in the Supabase dashboard URL or project settings.

## 3. Push Schema and Policies to Cloud

This repo already contains the schema and policy history in:

- `supabase/migrations/20260316000000_ecommerce_schema.sql`
- `supabase/migrations/20260317010000_reset_conflicting_product_policies.sql`
- `supabase/migrations/20260317013000_add_profiles_and_user_state.sql`
- `supabase/migrations/20260317020000_require_product_category_and_seed_default.sql`
- `supabase/migrations/20260317021000_enforce_max_product_images.sql`

Push them to the linked cloud project:

```bash
npx supabase db push
```

This is the safest way to reproduce the local schema and RLS setup in cloud.

## 4. Create the Storage Bucket in Cloud

This app uploads product images to the `product-media` bucket.

Create that bucket in the Supabase dashboard:

1. Open Storage
2. Create a bucket named `product-media`
3. Match its visibility to your intended production behavior

If you already rely on public product image URLs locally, keep the cloud bucket public too.

If you want stricter access later, change the app to use signed URLs first before making the bucket private.

## 5. Migrate Data

You have two practical options.

## Option A: Schema Only

Use this if you only need the structure in cloud and are fine re-entering content through the CMS.

Steps:

1. Run `npx supabase db push`
2. Create the `product-media` bucket
3. Start using the cloud project from the app

This is the simplest route if your local content is disposable.

## Option B: Schema Plus Existing Data

Use this if you want your current local CMS data copied to cloud.

### Export Local Data

Use a Postgres dump against the local database:

```bash
pg_dump \
  --data-only \
  --column-inserts \
  --dbname="postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  --schema=public \
  --file=local_public_data.sql
```

If you only want app tables, export just the relevant ones:

```bash
pg_dump \
  --data-only \
  --column-inserts \
  --dbname="postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  --schema=public \
  --table=categories \
  --table=products \
  --table=product_images \
  --table=product_variants \
  --table=profiles \
  --table=user_state \
  --file=local_app_data.sql
```

### Import Into Cloud

After `npx supabase db push` has created the schema in cloud, import the data using the cloud database connection string from the Supabase dashboard.

Example:

```bash
psql "YOUR_CLOUD_DB_URL" -f local_app_data.sql
```

### Important Note About Auth Users

`profiles.user_id` and `user_state.user_id` depend on `auth.users` records.

If your local data includes profiles or user state for accounts that do not exist in the cloud project's auth system, those rows can fail to import or become invalid.

For this app, the usual safe approach is:

1. Migrate product and category data first
2. Re-create real users in the cloud auth project
3. Only migrate profile and user_state data if the corresponding auth users also exist

If you only care about storefront and CMS content, it is reasonable to skip local auth-related data entirely.

## 6. Migrate Storage Files

Database rows in `product_images` only store metadata and URLs. The actual image files must also exist in cloud storage.

You need to copy objects from the local `product-media` bucket into the cloud `product-media` bucket.

You can do that in any of these ways:

1. Re-upload images through the CMS
2. Download local bucket contents and upload them to cloud manually
3. Write a one-off script using the Supabase Storage APIs

If you migrate `product_images` rows without migrating the files themselves, image URLs will point to objects that do not exist in the cloud bucket.

## 7. Update Environment Variables

Replace local Supabase values in `.env.local` with cloud values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_CLOUD_PUBLISHABLE_KEY
NEXT_PUBLIC_ADMIN_EMAILS=you@example.com
```

Notes:

- keep `GEMINI_API_KEY` unchanged unless you are also changing environments
- `NEXT_PUBLIC_ADMIN_EMAILS` still controls who gets CMS write-capable admin UI access
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` can remain unset because this app prefers `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

After updating env vars, restart the Next.js dev server.

## 8. Configure Auth Redirects in Cloud

In the cloud Supabase dashboard, make sure auth settings allow your app URLs.

Set these appropriately for your deployed environment:

1. Site URL
2. Additional redirect URLs

Examples:

- `http://localhost:3000` for local testing against cloud
- your production frontend URL for deployed usage

## 9. Verify the Migration

Test these flows after switching to the cloud project:

1. Sign up
2. Log in
3. Open the storefront and confirm products load
4. Open category CMS and product CMS
5. Create and update a category
6. Create and update a product
7. Upload a product image
8. Confirm the image appears on the storefront
9. Confirm cart and favorites sync still work when signed in

## 10. Common Failure Cases

### Products load but images are broken

Cause:

- storage objects were not copied to cloud
- or bucket visibility does not match how the app reads images

### CMS can read but writes fail

Cause:

- migrations were not fully pushed
- or cloud RLS policies differ from local

Fix:

```bash
npx supabase db push
```

Then inspect policies in the dashboard.

### Auth works but profile/user state rows fail

Cause:

- cloud auth users do not match imported local profile/user_state records

Fix:

- re-create the user in cloud auth first
- or skip auth-related data migration

### Admin UI opens but cannot edit

Cause:

- email is not listed in `NEXT_PUBLIC_ADMIN_EMAILS`

Fix:

- update the allowlist and restart the app

## Recommended Migration Strategy For This Repo

For this project, the lowest-risk path is:

1. Create the cloud project
2. Run `npx supabase link --project-ref ...`
3. Run `npx supabase db push`
4. Create the `product-media` bucket in cloud
5. Re-upload images or migrate storage objects
6. Update `.env.local` to use cloud URL and publishable key
7. Re-create admin users if needed
8. Test CMS and storefront end to end

If your local auth data is not important, do not migrate `profiles` and `user_state` blindly. Migrate content first, then let real cloud users generate fresh auth-linked rows.
