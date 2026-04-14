-- Migration: Make Store user management independent from HRM
-- Date: 2026-04-10
-- Purpose: Remove HRM SUPER_ADMIN coupling from Store access management so
--          Store roles are governed only by store_users and Store admins.

DROP POLICY IF EXISTS "store_users_super_admin_insert" ON public.store_users;
DROP POLICY IF EXISTS "store_users_super_admin_update" ON public.store_users;
DROP POLICY IF EXISTS "store_users_super_admin_delete" ON public.store_users;
DROP POLICY IF EXISTS "store_users_admin_insert" ON public.store_users;
DROP POLICY IF EXISTS "store_users_admin_update" ON public.store_users;
DROP POLICY IF EXISTS "store_users_admin_delete" ON public.store_users;

CREATE POLICY "store_users_admin_insert"
  ON public.store_users
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_store_admin());

CREATE POLICY "store_users_admin_update"
  ON public.store_users
  FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "store_users_admin_delete"
  ON public.store_users
  FOR DELETE
  TO authenticated
  USING (public.is_store_admin());

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ Store user management is now independent from HRM';
  RAISE NOTICE '✅ Store admins can manage store_users through Store roles only';
END $$;
