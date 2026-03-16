-- Reset conflicting legacy policies on products.
-- Some old setups created `products_write_admin` with auth.users lookup,
-- which causes: [42501] permission denied for table users.

DROP POLICY IF EXISTS products_write_admin ON public.products;
DROP POLICY IF EXISTS products_read_public ON public.products;

DROP POLICY IF EXISTS "Auth manage products" ON public.products;
CREATE POLICY "Auth manage products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (status = 'active');
