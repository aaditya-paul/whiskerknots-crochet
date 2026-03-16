-- Ensure there is always at least one category and products always belong to one.

DO $$
DECLARE
  default_category_id uuid;
BEGIN
  SELECT id
  INTO default_category_id
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
    )
    RETURNING id INTO default_category_id;
  END IF;

  UPDATE public.products
  SET category_id = default_category_id
  WHERE category_id IS NULL;
END;
$$;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_category_id_fkey;

ALTER TABLE public.products
  ALTER COLUMN category_id SET NOT NULL;

ALTER TABLE public.products
  ADD CONSTRAINT products_category_id_fkey
  FOREIGN KEY (category_id)
  REFERENCES public.categories(id)
  ON DELETE RESTRICT;

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

DROP TRIGGER IF EXISTS trg_prevent_deleting_last_category ON public.categories;

CREATE TRIGGER trg_prevent_deleting_last_category
BEFORE DELETE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.prevent_deleting_last_category();
