-- Migration: Add Store RLS policies
-- Date: 2026-04-10
-- Purpose: Secure Store tables with self-service user access, Store admin operations,
--          and HRM super-admin-only Store user management.

-- 1) Helper functions
CREATE OR REPLACE FUNCTION public.get_my_store_role()
RETURNS public.store_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT store_role
  FROM public.store_users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_store_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(public.get_my_store_role() = 'ADMIN', false);
$$;

GRANT EXECUTE ON FUNCTION public.get_my_store_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_store_admin() TO authenticated;

-- 2) Enum usage grants
GRANT USAGE ON TYPE public.store_role TO authenticated, service_role;
GRANT USAGE ON TYPE public.store_invoice_status TO authenticated, service_role;
GRANT USAGE ON TYPE public.store_stock_movement_type TO authenticated, service_role;
GRANT USAGE ON TYPE public.store_account_entry_category TO authenticated, service_role;
GRANT USAGE ON TYPE public.store_month_status TO authenticated, service_role;

-- 3) Enable RLS on Store tables
ALTER TABLE public.store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_account_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_month_closures ENABLE ROW LEVEL SECURITY;

-- 4) Drop existing Store policies if this migration is re-applied in a repaired environment
DROP POLICY IF EXISTS "store_users_select_self_or_admin" ON public.store_users;
DROP POLICY IF EXISTS "store_users_super_admin_insert" ON public.store_users;
DROP POLICY IF EXISTS "store_users_super_admin_update" ON public.store_users;
DROP POLICY IF EXISTS "store_users_super_admin_delete" ON public.store_users;

DROP POLICY IF EXISTS "store_products_select_store_users" ON public.store_products;
DROP POLICY IF EXISTS "store_products_admin_all" ON public.store_products;

DROP POLICY IF EXISTS "store_stock_entries_select_admin" ON public.store_stock_entries;
DROP POLICY IF EXISTS "store_stock_entries_admin_all" ON public.store_stock_entries;

DROP POLICY IF EXISTS "store_invoices_select_own_or_admin" ON public.store_invoices;
DROP POLICY IF EXISTS "store_invoices_insert_own" ON public.store_invoices;
DROP POLICY IF EXISTS "store_invoices_update_admin" ON public.store_invoices;
DROP POLICY IF EXISTS "store_invoices_delete_admin" ON public.store_invoices;

DROP POLICY IF EXISTS "store_invoice_items_select_own_or_admin" ON public.store_invoice_items;
DROP POLICY IF EXISTS "store_invoice_items_insert_own" ON public.store_invoice_items;
DROP POLICY IF EXISTS "store_invoice_items_update_admin" ON public.store_invoice_items;
DROP POLICY IF EXISTS "store_invoice_items_delete_admin" ON public.store_invoice_items;

DROP POLICY IF EXISTS "store_stock_movements_select_admin" ON public.store_stock_movements;
DROP POLICY IF EXISTS "store_stock_movements_admin_all" ON public.store_stock_movements;

DROP POLICY IF EXISTS "store_account_entries_select_own_or_admin" ON public.store_account_entries;
DROP POLICY IF EXISTS "store_account_entries_insert_admin" ON public.store_account_entries;
DROP POLICY IF EXISTS "store_account_entries_update_admin" ON public.store_account_entries;
DROP POLICY IF EXISTS "store_account_entries_delete_admin" ON public.store_account_entries;

DROP POLICY IF EXISTS "store_month_closures_select_admin" ON public.store_month_closures;
DROP POLICY IF EXISTS "store_month_closures_admin_all" ON public.store_month_closures;

-- 5) store_users policies
CREATE POLICY "store_users_select_self_or_admin"
  ON public.store_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_store_admin());

CREATE POLICY "store_users_super_admin_insert"
  ON public.store_users
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_hrm_role() = 'SUPER_ADMIN');

CREATE POLICY "store_users_super_admin_update"
  ON public.store_users
  FOR UPDATE
  TO authenticated
  USING (public.get_my_hrm_role() = 'SUPER_ADMIN')
  WITH CHECK (public.get_my_hrm_role() = 'SUPER_ADMIN');

CREATE POLICY "store_users_super_admin_delete"
  ON public.store_users
  FOR DELETE
  TO authenticated
  USING (public.get_my_hrm_role() = 'SUPER_ADMIN');

-- 6) store_products policies
CREATE POLICY "store_products_select_store_users"
  ON public.store_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.store_users su
      WHERE su.id = auth.uid()
    )
  );

CREATE POLICY "store_products_admin_all"
  ON public.store_products
  FOR ALL
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

-- 7) store_stock_entries policies
CREATE POLICY "store_stock_entries_select_admin"
  ON public.store_stock_entries
  FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

CREATE POLICY "store_stock_entries_admin_all"
  ON public.store_stock_entries
  FOR ALL
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

-- 8) store_invoices policies
CREATE POLICY "store_invoices_select_own_or_admin"
  ON public.store_invoices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_store_admin());

CREATE POLICY "store_invoices_insert_own"
  ON public.store_invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.store_users su
      WHERE su.id = auth.uid()
    )
  );

CREATE POLICY "store_invoices_update_admin"
  ON public.store_invoices
  FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "store_invoices_delete_admin"
  ON public.store_invoices
  FOR DELETE
  TO authenticated
  USING (public.is_store_admin());

-- 9) store_invoice_items policies
CREATE POLICY "store_invoice_items_select_own_or_admin"
  ON public.store_invoice_items
  FOR SELECT
  TO authenticated
  USING (
    public.is_store_admin()
    OR EXISTS (
      SELECT 1
      FROM public.store_invoices si
      WHERE si.id = store_invoice_items.invoice_id
        AND si.user_id = auth.uid()
    )
  );

CREATE POLICY "store_invoice_items_insert_own"
  ON public.store_invoice_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.store_invoices si
      WHERE si.id = store_invoice_items.invoice_id
        AND si.user_id = auth.uid()
    )
  );

CREATE POLICY "store_invoice_items_update_admin"
  ON public.store_invoice_items
  FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "store_invoice_items_delete_admin"
  ON public.store_invoice_items
  FOR DELETE
  TO authenticated
  USING (public.is_store_admin());

-- 10) store_stock_movements policies
CREATE POLICY "store_stock_movements_select_admin"
  ON public.store_stock_movements
  FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

CREATE POLICY "store_stock_movements_admin_all"
  ON public.store_stock_movements
  FOR ALL
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

-- 11) store_account_entries policies
CREATE POLICY "store_account_entries_select_own_or_admin"
  ON public.store_account_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_store_admin());

CREATE POLICY "store_account_entries_insert_admin"
  ON public.store_account_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_store_admin());

CREATE POLICY "store_account_entries_update_admin"
  ON public.store_account_entries
  FOR UPDATE
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "store_account_entries_delete_admin"
  ON public.store_account_entries
  FOR DELETE
  TO authenticated
  USING (public.is_store_admin());

-- 12) store_month_closures policies
CREATE POLICY "store_month_closures_select_admin"
  ON public.store_month_closures
  FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

CREATE POLICY "store_month_closures_admin_all"
  ON public.store_month_closures
  FOR ALL
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

-- 13) Refresh schema cache
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ Added Store RLS policies';
  RAISE NOTICE '✅ Store users can view their own finance records';
  RAISE NOTICE '✅ Store admins can manage operational Store tables';
  RAISE NOTICE '✅ Only HRM SUPER_ADMIN can manage store_users';
END $$;
