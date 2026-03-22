-- =============================================================
-- Add reviewer snapshot fields and review query performance index
-- =============================================================

BEGIN;

ALTER TABLE public.product_reviews
  ADD COLUMN IF NOT EXISTS reviewer_name text,
  ADD COLUMN IF NOT EXISTS reviewer_photo_url text;

-- Backfill from profiles where available.
UPDATE public.product_reviews pr
SET
  reviewer_name = COALESCE(NULLIF(p.display_name, ''), split_part(p.email, '@', 1), 'Customer'),
  reviewer_photo_url = p.photo_url
FROM public.profiles p
WHERE p.id = pr.user_id
  AND (pr.reviewer_name IS NULL OR pr.reviewer_photo_url IS NULL);

-- Fallback for any rows where profile is missing.
UPDATE public.product_reviews
SET reviewer_name = COALESCE(reviewer_name, 'Customer')
WHERE reviewer_name IS NULL;

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_rating_created
  ON public.product_reviews(product_id, rating, created_at DESC);

COMMIT;
