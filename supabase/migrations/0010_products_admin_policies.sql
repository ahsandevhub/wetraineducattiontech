-- Allow admin users to manage products
DO $$
BEGIN
  BEGIN
    EXECUTE 'create policy "products insert admin" on public.products for insert with check (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE 'create policy "products update admin" on public.products for update using (public.is_admin()) with check (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE 'create policy "products delete admin" on public.products for delete using (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
