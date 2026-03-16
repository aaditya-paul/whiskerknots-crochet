-- Enforce a hard backend limit of 5 images per product.
-- This guards against direct DB/API writes that bypass UI checks.

CREATE OR REPLACE FUNCTION public.enforce_max_product_images()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  existing_count integer;
  max_images constant integer := 5;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*)
    INTO existing_count
    FROM public.product_images
    WHERE product_id = NEW.product_id;

    IF existing_count >= max_images THEN
      RAISE EXCEPTION 'A product can have at most % images.', max_images
        USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Only relevant when moving an image to a different product.
    IF NEW.product_id IS DISTINCT FROM OLD.product_id THEN
      SELECT COUNT(*)
      INTO existing_count
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

DROP TRIGGER IF EXISTS trg_enforce_max_product_images ON public.product_images;

CREATE TRIGGER trg_enforce_max_product_images
BEFORE INSERT OR UPDATE OF product_id ON public.product_images
FOR EACH ROW
EXECUTE FUNCTION public.enforce_max_product_images();
