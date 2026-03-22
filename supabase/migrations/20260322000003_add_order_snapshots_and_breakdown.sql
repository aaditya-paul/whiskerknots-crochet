-- =============================================================
-- Add order snapshot fields and pricing/address breakdown
-- =============================================================

BEGIN;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS shipping_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS tax_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS shipping_first_name text,
  ADD COLUMN IF NOT EXISTS shipping_last_name text,
  ADD COLUMN IF NOT EXISTS shipping_address text,
  ADD COLUMN IF NOT EXISTS shipping_city text,
  ADD COLUMN IF NOT EXISTS shipping_state text,
  ADD COLUMN IF NOT EXISTS shipping_zip_code text,
  ADD COLUMN IF NOT EXISTS shipping_country text,
  ADD COLUMN IF NOT EXISTS shipping_phone text,
  ADD COLUMN IF NOT EXISTS shipping_email text;

UPDATE public.orders
SET
  subtotal_amount = COALESCE(subtotal_amount, total_amount),
  shipping_amount = COALESCE(shipping_amount, 0),
  tax_amount = COALESCE(tax_amount, 0)
WHERE subtotal_amount IS NULL OR shipping_amount IS NULL OR tax_amount IS NULL;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS product_name text,
  ADD COLUMN IF NOT EXISTS product_image_url text,
  ADD COLUMN IF NOT EXISTS product_variant_label text,
  ADD COLUMN IF NOT EXISTS line_total numeric(10,2);

UPDATE public.order_items oi
SET
  product_name = COALESCE(oi.product_name, p.name),
  product_image_url = COALESCE(oi.product_image_url, p.thumbnail_url),
  product_variant_label = COALESCE(oi.product_variant_label, 'Standard'),
  line_total = COALESCE(oi.line_total, oi.quantity * oi.price_at_purchase)
FROM public.products p
WHERE p.id = oi.product_id
  AND (
    oi.product_name IS NULL
    OR oi.product_image_url IS NULL
    OR oi.product_variant_label IS NULL
    OR oi.line_total IS NULL
  );

UPDATE public.order_items
SET
  product_variant_label = COALESCE(product_variant_label, 'Standard'),
  line_total = COALESCE(line_total, quantity * price_at_purchase)
WHERE product_variant_label IS NULL OR line_total IS NULL;

COMMIT;
