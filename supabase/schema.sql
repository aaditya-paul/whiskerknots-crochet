-- =============================================================
-- Whiskerknots Crochet – Canonical Database Schema
-- Generated from all migrations as of 2026-03-17.
-- Run this idempotent file against a fresh database to
-- reproduce the full schema, policies, triggers, and seed data.
-- =============================================================


-- =============================================================
-- EXTENSIONS
-- =============================================================

-- gen_random_uuid() is built-in on Postgres 13+ (used by Supabase).
-- No extension needed.


-- =============================================================
-- TABLES
-- =============================================================

-- ── Categories ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  slug            text        UNIQUE NOT NULL,
  description     text,
  image_url       text,
  parent_id       uuid        REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active       boolean     NOT NULL DEFAULT true,
  sort_order      integer     NOT NULL DEFAULT 0,
  seo_title       text,
  seo_description text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Products ──────────────────────────────────────────────────
-- NOTE: category_id is NOT NULL (enforced in migration 4).
--       The FK uses ON DELETE RESTRICT to prevent orphaned products.
CREATE TABLE IF NOT EXISTS public.products (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text        NOT NULL,
  slug              text        UNIQUE NOT NULL,
  description       text,
  short_description text,
  status            text        NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('active', 'draft', 'archived')),
  category_id       uuid        NOT NULL
                                REFERENCES public.categories(id) ON DELETE RESTRICT,

  -- Pricing
  price             numeric(10,2) NOT NULL DEFAULT 0,
  compare_at_price  numeric(10,2),
  cost_per_item     numeric(10,2),

  -- Media (thumbnail stored here for fast list rendering)
  thumbnail_url     text,

  -- Inventory
  sku               text,
  barcode           text,
  in_stock          boolean     NOT NULL DEFAULT true,
  quantity          integer,
  track_quantity    boolean     NOT NULL DEFAULT false,
  allow_backorder   boolean     NOT NULL DEFAULT false,

  -- Shipping
  weight            numeric,
  weight_unit       text        DEFAULT 'g',
  length            numeric,
  width             numeric,
  height            numeric,
  dimension_unit    text        DEFAULT 'cm',

  -- Organisation
  tags              text[]      DEFAULT '{}',
  is_featured       boolean     NOT NULL DEFAULT false,
  is_new            boolean     NOT NULL DEFAULT false,
  sort_order        integer     NOT NULL DEFAULT 0,

  -- SEO
  seo_title         text,
  seo_description   text,

  -- Flexible data
  custom_fields     jsonb       DEFAULT '{}',

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ── Product Images ────────────────────────────────────────────
-- Hard limit: 5 images per product (enforced by trigger below).
CREATE TABLE IF NOT EXISTS public.product_images (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url           text        NOT NULL,
  storage_path  text,                          -- relative path inside the product-media Storage bucket
  alt           text        NOT NULL DEFAULT '',
  is_thumbnail  boolean     NOT NULL DEFAULT false,
  sort_order    integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── Product Variants ──────────────────────────────────────────
-- Each variant can override price/quantity and carry arbitrary
-- attributes, e.g. {"Color": "Red", "Size": "M"}.
CREATE TABLE IF NOT EXISTS public.product_variants (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name             text        NOT NULL,
  sku              text,
  price            numeric(10,2),
  compare_at_price numeric(10,2),
  quantity         integer,
  in_stock         boolean     NOT NULL DEFAULT true,
  image_url        text,
  attributes       jsonb       NOT NULL DEFAULT '{}',
  sort_order       integer     NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── Profiles ──────────────────────────────────────────────────
-- Mirror of auth.users maintained by the app (AuthContext).
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text        NOT NULL,
  display_name text,
  photo_url    text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ── User State ────────────────────────────────────────────────
-- Per-user cart and favourites persisted to Supabase (CartContext / FavoritesSync).
CREATE TABLE IF NOT EXISTS public.user_state (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cart       jsonb       NOT NULL DEFAULT '[]'::jsonb,
  favorites  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- =============================================================
-- FUNCTIONS
-- =============================================================

-- Shared updated_at function used by categories and products.
CREATE OR REPLACE FUNCTION public._update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Shared updated_at function used by profiles and user_state.
-- (Identical logic; kept as a separate symbol intentionally.)
CREATE OR REPLACE FUNCTION public._set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Prevents deleting the very last remaining category (products require one).
CREATE OR REPLACE FUNCTION public.prevent_deleting_last_category()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.categories WHERE id <> OLD.id) = 0 THEN
    RAISE EXCEPTION 'At least one category must exist.';
  END IF;
  RETURN OLD;
END;
$$;

-- Enforces a hard limit of 5 images per product at the DB level.
CREATE OR REPLACE FUNCTION public.enforce_max_product_images()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  existing_count integer;
  max_images     constant integer := 5;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*) INTO existing_count
    FROM public.product_images
    WHERE product_id = NEW.product_id;

    IF existing_count >= max_images THEN
      RAISE EXCEPTION 'A product can have at most % images.', max_images
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Only matters when re-assigning an image to a different product.
    IF NEW.product_id IS DISTINCT FROM OLD.product_id THEN
      SELECT COUNT(*) INTO existing_count
      FROM public.product_images
      WHERE product_id = NEW.product_id;

      IF existing_count >= max_images THEN
        RAISE EXCEPTION 'A product can have at most % images.', max_images
          USING ERRCODE = 'check_violation';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;


-- =============================================================
-- TRIGGERS
-- =============================================================

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public._update_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public._update_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public._set_updated_at();

DROP TRIGGER IF EXISTS trg_user_state_updated_at ON public.user_state;
CREATE TRIGGER trg_user_state_updated_at
  BEFORE UPDATE ON public.user_state
  FOR EACH ROW EXECUTE FUNCTION public._set_updated_at();

DROP TRIGGER IF EXISTS trg_prevent_deleting_last_category ON public.categories;
CREATE TRIGGER trg_prevent_deleting_last_category
  BEFORE DELETE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.prevent_deleting_last_category();

DROP TRIGGER IF EXISTS trg_enforce_max_product_images ON public.product_images;
CREATE TRIGGER trg_enforce_max_product_images
  BEFORE INSERT OR UPDATE OF product_id ON public.product_images
  FOR EACH ROW EXECUTE FUNCTION public.enforce_max_product_images();


-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_products_status      ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug        ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON public.products(is_featured)
  WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_categories_slug      ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_pid   ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_pid ON public.product_variants(product_id);


-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_state       ENABLE ROW LEVEL SECURITY;

-- ── categories ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
CREATE POLICY "Public read active categories" ON public.categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Auth manage categories" ON public.categories;
CREATE POLICY "Auth manage categories" ON public.categories
  FOR ALL USING (auth.role() = 'authenticated');

-- ── products ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Auth manage products" ON public.products;
CREATE POLICY "Auth manage products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

-- ── product_images ────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read product_images" ON public.product_images;
CREATE POLICY "Public read product_images" ON public.product_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage product_images" ON public.product_images;
CREATE POLICY "Auth manage product_images" ON public.product_images
  FOR ALL USING (auth.role() = 'authenticated');

-- ── product_variants ──────────────────────────────────────────
DROP POLICY IF EXISTS "Public read product_variants" ON public.product_variants;
CREATE POLICY "Public read product_variants" ON public.product_variants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage product_variants" ON public.product_variants;
CREATE POLICY "Auth manage product_variants" ON public.product_variants
  FOR ALL USING (auth.role() = 'authenticated');

-- ── profiles ─────────────────────────────────────────────────
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ── user_state ───────────────────────────────────────────────
DROP POLICY IF EXISTS user_state_select_own ON public.user_state;
CREATE POLICY user_state_select_own ON public.user_state
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_state_insert_own ON public.user_state;
CREATE POLICY user_state_insert_own ON public.user_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_state_update_own ON public.user_state;
CREATE POLICY user_state_update_own ON public.user_state
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- =============================================================
-- STORAGE
-- =============================================================

-- Public bucket for product media (images).
-- All objects are publicly readable; authenticated users can write.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product-media" ON storage.objects;
CREATE POLICY "Public read product-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-media');

DROP POLICY IF EXISTS "Auth manage product-media" ON storage.objects;
CREATE POLICY "Auth manage product-media" ON storage.objects
  FOR ALL USING (bucket_id = 'product-media' AND auth.role() = 'authenticated');


-- =============================================================
-- SEED DATA
-- =============================================================

-- Ensure at least one category always exists.
-- Products require a non-null category_id, so a default is seeded
-- if the categories table is empty.
DO $$
DECLARE
  default_category_id uuid;
BEGIN
  SELECT id INTO default_category_id
  FROM public.categories
  ORDER BY sort_order ASC, name ASC
  LIMIT 1;

  IF default_category_id IS NULL THEN
    INSERT INTO public.categories (name, slug, description, is_active, sort_order)
    VALUES (
      'Crochet Essentials',
      'crochet-essentials',
      'General handmade crochet creations and everyday favourites.',
      true,
      0
    );
  END IF;
END;
$$;
