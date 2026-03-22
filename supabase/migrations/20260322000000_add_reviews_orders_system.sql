-- =============================================================
-- Add Reviews, Ratings, and Orders System
-- =============================================================

BEGIN;

-- ── Orders ────────────────────────────────────────────────────
-- Tracks customer orders
CREATE TABLE IF NOT EXISTS public.orders (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number    text        NOT NULL UNIQUE,
  status          text        NOT NULL DEFAULT 'completed'
                              CHECK (status IN ('pending', 'completed', 'shipped', 'cancelled')),
  total_amount    numeric(10,2) NOT NULL DEFAULT 0,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Order Items ───────────────────────────────────────────────
-- Individual items in an order
CREATE TABLE IF NOT EXISTS public.order_items (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity        integer     NOT NULL DEFAULT 1,
  price_at_purchase numeric(10,2) NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Product Reviews ───────────────────────────────────────────
-- Customer reviews and ratings for products
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      uuid        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating          integer     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title           text,
  content         text,
  helpful_count   integer     NOT NULL DEFAULT 0,
  verified_purchase boolean    NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- =============================================================
-- TRIGGERS
-- =============================================================

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public._update_updated_at();

DROP TRIGGER IF EXISTS trg_product_reviews_updated_at ON public.product_reviews;
CREATE TRIGGER trg_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public._update_updated_at();

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON public.product_reviews(created_at DESC);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE public.orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- ── orders ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
CREATE POLICY "Users create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own orders" ON public.orders;
CREATE POLICY "Users update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── order_items ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users create own order items" ON public.order_items;
CREATE POLICY "Users create own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
  );

-- ── product_reviews ───────────────────────────────────────────
DROP POLICY IF EXISTS "Public read product reviews" ON public.product_reviews;
CREATE POLICY "Public read product reviews" ON public.product_reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users create review after purchase" ON public.product_reviews;
CREATE POLICY "Users create review after purchase" ON public.product_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.orders o
      JOIN public.order_items oi ON oi.order_id = o.id
      WHERE o.user_id = auth.uid()
        AND o.status = 'completed'
        AND oi.product_id = product_id
    )
  );

DROP POLICY IF EXISTS "Users update own reviews" ON public.product_reviews;
CREATE POLICY "Users update own reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own reviews" ON public.product_reviews;
CREATE POLICY "Users delete own reviews" ON public.product_reviews
  FOR DELETE USING (auth.uid() = user_id);

COMMIT;
