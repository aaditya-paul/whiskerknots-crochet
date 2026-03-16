# Whiskerknots Crochet

[Live Site](https://whiskerknots-crochet.vercel.app/)

Whiskerknots Crochet is a Next.js storefront and lightweight CMS for a handmade crochet business. The app combines a warm, branded customer-facing shop with a Supabase-backed admin area for managing categories, products, images, and variants.

The current codebase is built around:

- a Next.js App Router storefront
- Supabase auth, Postgres, storage, and realtime
- a local-first cart and favorites flow with authenticated sync
- a small Gemini-powered support assistant called KnitWit

## Status

Active development.

Recent platform work includes:

- shared storefront product state to prevent duplicate Supabase subscriptions
- retry and dedupe handling for transient product-loading failures
- normalized product image handling for cards and product detail pages

## Tech Stack

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Framer Motion
- Lucide React
- Supabase SSR browser client
- Supabase Postgres, Auth, Realtime, and Storage
- Google Gemini via `@google/genai`

## What The App Includes

### Storefront

- Home page with featured products
- Shop listing with category filtering
- Product detail pages with gallery images and related products
- About, Contact, Care, Shipping, Returns, Login, Signup, Profile, and Checkout pages
- Floating AI assistant for lightweight customer support questions
- Favorites drawer and cart drawer available globally

### Admin CMS

- Admin dashboard
- Product list and editor
- Category management
- Product images stored in Supabase Storage
- Product variants stored in Postgres

### User State

- Email/password auth with Supabase
- Profile auto-creation in `profiles`
- Cart persisted locally and synced to `user_state` when signed in
- Favorites persisted locally and synced to `user_state` when signed in

## Key Routes

### Public routes

- `/` and `/home` - storefront landing page
- `/shop` - product listing
- `/shop/[slug]` - product detail page
- `/about`
- `/contact`
- `/care`
- `/shipping`
- `/returns`
- `/checkout`
- `/login`
- `/signup`
- `/profile`

### Admin routes

- `/admin` - dashboard
- `/admin/products` - product list
- `/admin/products/new` - create product
- `/admin/products/[id]` - edit product
- `/admin/categories` - category management

## Project Structure

```text
app/
  api/chat/route.ts           Gemini-backed assistant endpoint
  admin/                      Admin dashboard and CMS pages
  home/                       Customer home page
  shop/                       Shop listing and product detail pages
components/                   Shared UI components
context/                      Auth, cart, and shared product state
hooks/                        App hooks such as useProducts
lib/                          Shared clients, including Supabase
services/                     Supabase CMS and product data access
supabase/
  migrations/                 Schema and policy migrations
types/                        Shared TypeScript models
utils/                        Animation and product image helpers
```

## Important Files

- `app/layout.tsx` - global layout and provider wiring
- `app/api/chat/route.ts` - Gemini chat endpoint used by KnitWit
- `context/AuthContext.tsx` - auth and profile bootstrap
- `context/CartContext.tsx` - cart state and Supabase sync
- `context/ProductsContext.tsx` - shared storefront product/category state
- `hooks/useProducts.ts` - consumer hook for storefront product data
- `services/productCmsService.ts` - Supabase reads, writes, storage uploads, and realtime integration
- `components/ProductCard.tsx` - storefront product card rendering
- `utils/productImages.ts` - image normalization and storefront image selection logic
- `SUPABASE_LOCAL_SETUP.md` - focused local database setup guide
- `UI_THEME_GUIDE.md` - brand, layout, animation, and style guidance

## Environment Variables

Copy `env.example` to `.env.local` and fill in real values.

```env
GEMINI_API_KEY=

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_local_supabase_publishable_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_supabase_anon_key_here

# Comma-separated email allowlist for /admin access
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

### Notes

- `GEMINI_API_KEY` must stay server-side. Do not prefix it with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is the preferred key name.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is still supported as a fallback for compatibility.
- `NEXT_PUBLIC_ADMIN_EMAILS` is a client-side allowlist that controls who gets write-capable admin access in the UI.

## Local Development

### Prerequisites

- Node.js 20 or newer recommended
- npm
- Supabase CLI
- a Gemini API key if you want the chat assistant to work locally

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

Use `env.example` as the starting point.

### 3. Start Supabase locally

```bash
npx supabase start
```

To inspect local URLs and keys:

```bash
npx supabase status
```

### 4. Apply local schema and policies

The recommended path is a full reset:

```bash
npx supabase db reset
```

This applies the migrations in `supabase/migrations/` including ecommerce schema, policy cleanup, profiles, and user state.

### 5. Run the Next.js app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev` - start Next.js in development mode
- `npm run build` - create a production build
- `npm run start` - run the production build locally
- `npm run lint` - run ESLint
- `npm run start:db` - start the local Supabase stack

## Data Model Overview

The storefront and admin experience are backed by several main tables:

- `categories` - category metadata, ordering, activation, SEO fields
- `products` - main product records, pricing, stock, tags, and thumbnail URL
- `product_images` - image gallery rows and thumbnail designation
- `product_variants` - variant-specific inventory and pricing
- `profiles` - profile data for authenticated users
- `user_state` - synced cart and favorites state per user

Supabase Storage uses a public bucket named `product-media` for uploaded product images.

## How Storefront Data Loading Works

The storefront no longer lets every component create its own Supabase product subscription.

Current flow:

- `ProductsProvider` loads categories once and subscribes to product changes once
- `useProducts()` reads shared state from context
- `productCmsService` dedupes concurrent product/category requests
- transient abort or timeout failures are retried before surfacing as errors
- realtime refreshes invalidate the storefront cache and reload products safely

This avoids duplicated requests from components like the footer, home page, shop listing, product detail page, and favorites drawer.

## Product Image Handling

Product images can come from either:

- `products.thumbnail_url`
- related `product_images` rows

The storefront normalizes and resolves image sources through `utils/productImages.ts` so cards and product pages can still render correctly when:

- only `product_images` rows exist
- image URLs are relative storage paths
- local Supabase storage is served from `127.0.0.1` or `localhost`

If you change `next.config.ts`, restart the dev server so updated image host rules take effect.

## Authentication And Admin Access

Authentication uses Supabase email/password auth.

Behavior to know:

- `AuthContext` reads the current session on boot
- a matching `profiles` row is loaded or created automatically
- `/admin` requires a logged-in user
- users not listed in `NEXT_PUBLIC_ADMIN_EMAILS` can still reach the admin shell but are treated as view-only in the UI

Database write access for CMS tables is granted to authenticated users by migration policy. The app-level admin email check is what limits practical CMS editing in the interface.

## Cart And Favorites Sync

Cart and favorites are designed to feel instant for anonymous users and still persist for signed-in users.

Flow:

- local cart is stored in `localStorage` under `whiskerknots-cart`
- favorites are stored in `localStorage` under `favorites`
- after sign-in, local state merges into `user_state`
- future cart updates sync back to Supabase automatically

## Chat Assistant

KnitWit is the floating support assistant shown globally.

Implementation summary:

- `components/ChatAssistant.tsx` sends messages to `/api/chat`
- `app/api/chat/route.ts` uses `@google/genai`
- responses are streamed back to the client incrementally
- the system prompt keeps replies short and on-brand for Whiskerknots

If `GEMINI_API_KEY` is missing, the route returns an error and the assistant will fail gracefully.

## Styling And Design System

This project uses a warm, rounded, handcrafted visual language.

Highlights:

- Tailwind CSS 4 for styling
- custom color tokens defined in `app/globals.css`
- Quicksand and Comfortaa loaded through `next/font/google`
- Framer Motion used for hover states, page transitions, and ambient effects

See `UI_THEME_GUIDE.md` for the full visual direction, component patterns, color palette, and motion guidelines.

## Deployment Notes

For production deployment you will need:

- a hosted Supabase project
- production `NEXT_PUBLIC_SUPABASE_URL`
- production publishable key
- `GEMINI_API_KEY`
- a correct `NEXT_PUBLIC_ADMIN_EMAILS` allowlist

Standard production commands:

```bash
npm run build
npm run start
```

## Troubleshooting

### Products load slowly or fail with `AbortError` / lock errors

This codebase now mitigates the common client-side duplicate-request issue by using shared storefront state and request deduping. If you still see failures:

- verify local Supabase is running
- check that `NEXT_PUBLIC_SUPABASE_URL` and the publishable key are correct
- refresh after starting Supabase so the client reconnects cleanly

### Product images do not render

Check the following:

- the product has either `thumbnail_url` or related `product_images`
- the `product-media` storage bucket exists and is public
- the app has been restarted after changes to `next.config.ts`
- local storage URLs use `127.0.0.1:54321` or `localhost:54321`

### Admin writes fail with permissions errors

If you see old RLS errors such as permission issues around `auth.users`, reset the local database:

```bash
npx supabase db reset
```

That reapplies the repo migrations and removes old conflicting policies.

### Chat assistant fails locally

Check:

- `GEMINI_API_KEY` exists in `.env.local`
- you restarted the Next.js dev server after editing env vars
- requests are reaching `/api/chat`

### Env changes do not seem to apply

Restart the dev server after editing:

- `.env.local`
- `next.config.ts`

## Additional Docs

- `SUPABASE_LOCAL_SETUP.md` - detailed local Supabase setup and policy notes
- `UI_THEME_GUIDE.md` - design system and branding reference

## Recommended Local Workflow

```bash
npm install
npx supabase start
npx supabase db reset
npm run dev
```

Then:

1. Create or sign in with an email listed in `NEXT_PUBLIC_ADMIN_EMAILS`.
2. Add categories in `/admin/categories`.
3. Add products in `/admin/products/new`.
4. Verify shop listing, product pages, cart, favorites, and chat.

## License

No license file is currently included in this repository.
