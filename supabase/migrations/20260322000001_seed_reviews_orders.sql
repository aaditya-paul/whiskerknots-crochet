-- =============================================================
-- Seed Reviews, Ratings, and Orders with Dummy Data
-- =============================================================

BEGIN;

-- Seed completed orders for up to 4 existing users and up to 3 products.
WITH users_seed AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS rn
  FROM auth.users
  LIMIT 4
),
products_seed AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS rn
  FROM public.products
  LIMIT 3
),
orders_seed AS (
  SELECT
    u.id AS user_id,
    u.rn,
    format('ORD-DUMMY-%s', lpad(u.rn::text, 3, '0')) AS order_number,
    now() - ((u.rn * 4)::text || ' days')::interval AS created_at
  FROM users_seed u
),
upsert_orders AS (
  INSERT INTO public.orders (user_id, order_number, status, total_amount, created_at, updated_at)
  SELECT
    o.user_id,
    o.order_number,
    'completed',
    (79 + o.rn * 12)::numeric(10,2),
    o.created_at,
    o.created_at
  FROM orders_seed o
  ON CONFLICT (order_number)
  DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at
  RETURNING id, user_id, order_number
)
INSERT INTO public.order_items (order_id, product_id, quantity, price_at_purchase, created_at)
SELECT
  uo.id,
  p.id,
  ((right(uo.order_number, 1))::int % 2) + 1,
  (59 + p.rn * 9)::numeric(10,2),
  now() - interval '1 day'
FROM upsert_orders uo
JOIN products_seed p ON p.rn = ((right(uo.order_number, 3))::int % (SELECT greatest(count(*), 1) FROM products_seed)) + 1
WHERE NOT EXISTS (
  SELECT 1
  FROM public.order_items oi
  WHERE oi.order_id = uo.id
    AND oi.product_id = p.id
);

-- Seed reviews only for actual purchase pairs so review eligibility is valid.
WITH purchase_pairs AS (
  SELECT DISTINCT
    o.user_id,
    oi.product_id,
    min(o.created_at) AS purchased_at
  FROM public.orders o
  JOIN public.order_items oi ON oi.order_id = o.id
  WHERE o.status = 'completed'
  GROUP BY o.user_id, oi.product_id
),
review_candidates AS (
  SELECT
    user_id,
    product_id,
    purchased_at,
    row_number() OVER (ORDER BY purchased_at, user_id, product_id) AS rn
  FROM purchase_pairs
  LIMIT 8
)
INSERT INTO public.product_reviews (
  product_id,
  user_id,
  rating,
  title,
  content,
  verified_purchase,
  created_at,
  updated_at
)
SELECT
  rc.product_id,
  rc.user_id,
  ((rc.rn % 5) + 1),
  CASE ((rc.rn % 5) + 1)
    WHEN 5 THEN 'Absolutely love it'
    WHEN 4 THEN 'Great quality'
    WHEN 3 THEN 'Pretty good overall'
    WHEN 2 THEN 'Could be better'
    ELSE 'Not what I expected'
  END,
  CASE ((rc.rn % 5) + 1)
    WHEN 5 THEN 'Beautiful piece and excellent finish. Would buy again.'
    WHEN 4 THEN 'Looks lovely and feels durable. Happy with this purchase.'
    WHEN 3 THEN 'Decent product for the price. Delivery was smooth.'
    WHEN 2 THEN 'The item is okay, but I expected better detailing.'
    ELSE 'The quality did not match my expectations this time.'
  END,
  true,
  rc.purchased_at + interval '2 days',
  rc.purchased_at + interval '2 days'
FROM review_candidates rc
ON CONFLICT (product_id, user_id) DO NOTHING;

COMMIT;
