-- =========================================================
-- Whiskerknots E-Commerce Schema
-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- =========================================================

-- ─── CATEGORIES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  slug           text UNIQUE NOT NULL,
  description    text,
  image_url      text,
  parent_id      uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_active      boolean NOT NULL DEFAULT true,
  sort_order     integer NOT NULL DEFAULT 0,
  seo_title      text,
  seo_description text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ─── PRODUCTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  slug              text UNIQUE NOT NULL,
  description       text,
  short_description text,
  status            text NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('active', 'draft', 'archived')),
  category_id       uuid REFERENCES categories(id) ON DELETE SET NULL,

  -- Pricing
  price             numeric(10,2) NOT NULL DEFAULT 0,
  compare_at_price  numeric(10,2),
  cost_per_item     numeric(10,2),

  -- Media (thumbnail stored here for fast list rendering)
  thumbnail_url     text,

  -- Inventory
  sku               text,
  barcode           text,
  in_stock          boolean NOT NULL DEFAULT true,
  quantity          integer,
  track_quantity    boolean NOT NULL DEFAULT false,
  allow_backorder   boolean NOT NULL DEFAULT false,

  -- Shipping
  weight            numeric,
  weight_unit       text DEFAULT 'g',
  length            numeric,
  width             numeric,
  height            numeric,
  dimension_unit    text DEFAULT 'cm',

  -- Organisation
  tags              text[] DEFAULT '{}',
  is_featured       boolean NOT NULL DEFAULT false,
  is_new            boolean NOT NULL DEFAULT false,
  sort_order        integer NOT NULL DEFAULT 0,

  -- SEO
  seo_title         text,
  seo_description   text,

  -- Custom / flexible data
  custom_fields     jsonb DEFAULT '{}',

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── PRODUCT IMAGES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url           text NOT NULL,
  storage_path  text,           -- relative path inside Supabase Storage bucket
  alt           text NOT NULL DEFAULT '',
  is_thumbnail  boolean NOT NULL DEFAULT false,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── PRODUCT VARIANTS ────────────────────────────────────
-- Each variant can override price / quantity and carry arbitrary
-- attributes like {Color: "Red", Size: "M"}
CREATE TABLE IF NOT EXISTS product_variants (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name              text NOT NULL,
  sku               text,
  price             numeric(10,2),
  compare_at_price  numeric(10,2),
  quantity          integer,
  in_stock          boolean NOT NULL DEFAULT true,
  image_url         text,
  attributes        jsonb NOT NULL DEFAULT '{}',
  sort_order        integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ─── AUTO-UPDATE updated_at ───────────────────────────────
CREATE OR REPLACE FUNCTION _update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION _update_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION _update_updated_at();

-- ─── INDEXES ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_status      ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug        ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_categories_slug      ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_pid   ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_pid ON product_variants(product_id);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────
ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Public: read active categories
DROP POLICY IF EXISTS "Public read active categories" ON categories;
CREATE POLICY "Public read active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Public: read active products
DROP POLICY IF EXISTS "Public read active products" ON products;
CREATE POLICY "Public read active products" ON products
  FOR SELECT USING (status = 'active');

-- Public: read images + variants (gated by product visibility above)
DROP POLICY IF EXISTS "Public read product_images" ON product_images;
CREATE POLICY "Public read product_images" ON product_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read product_variants" ON product_variants;
CREATE POLICY "Public read product_variants" ON product_variants
  FOR SELECT USING (true);

-- Authenticated (admin): full access to everything
DROP POLICY IF EXISTS "Auth manage categories" ON categories;
CREATE POLICY "Auth manage categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth manage products" ON products;
CREATE POLICY "Auth manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth manage product_images" ON product_images;
CREATE POLICY "Auth manage product_images" ON product_images
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth manage product_variants" ON product_variants;
CREATE POLICY "Auth manage product_variants" ON product_variants
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── STORAGE BUCKET ──────────────────────────────────────
-- Run this block separately if you prefer the Supabase Dashboard UI.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product-media" ON storage.objects;
CREATE POLICY "Public read product-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-media');

DROP POLICY IF EXISTS "Auth manage product-media" ON storage.objects;
CREATE POLICY "Auth manage product-media" ON storage.objects
  FOR ALL USING (bucket_id = 'product-media' AND auth.role() = 'authenticated');
