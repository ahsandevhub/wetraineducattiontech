-- Migration: Add Store product image support
-- Date: 2026-04-16
-- Purpose: Allow a single optional product image using Supabase Storage

ALTER TABLE public.store_products
  ADD COLUMN IF NOT EXISTS image_url TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-products',
  'store-products',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  BEGIN
    EXECUTE 'create policy "store products images read" on storage.objects for select using (bucket_id = ''store-products'')';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE 'create policy "store products images insert managers" on storage.objects for insert with check (bucket_id = ''store-products'' and public.has_store_permission(''product_manage''))';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE 'create policy "store products images update managers" on storage.objects for update using (bucket_id = ''store-products'' and public.has_store_permission(''product_manage'')) with check (bucket_id = ''store-products'' and public.has_store_permission(''product_manage''))';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  BEGIN
    EXECUTE 'create policy "store products images delete managers" on storage.objects for delete using (bucket_id = ''store-products'' and public.has_store_permission(''product_manage''))';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;