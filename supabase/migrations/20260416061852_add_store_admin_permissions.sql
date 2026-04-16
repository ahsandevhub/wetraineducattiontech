-- Add fine-grained Store admin permissions while keeping Store employees unchanged
-- Admins keep Store admin route access, but specific mutation actions now require
-- explicit permissions assigned per user.

BEGIN;

CREATE TABLE IF NOT EXISTS public.store_admin_permissions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT store_admin_permissions_permission_key_check CHECK (
    permission_key IN (
      'owner_purchase_manage',
      'balance_add',
      'stock_manage',
      'product_manage',
      'invoice_manage',
      'permissions_manage'
    )
  ),
  PRIMARY KEY (user_id, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_store_admin_permissions_user_id
  ON public.store_admin_permissions(user_id);

CREATE INDEX IF NOT EXISTS idx_store_admin_permissions_permission_key
  ON public.store_admin_permissions(permission_key);

DROP TRIGGER IF EXISTS update_store_admin_permissions_updated_at
  ON public.store_admin_permissions;
CREATE TRIGGER update_store_admin_permissions_updated_at
  BEFORE UPDATE ON public.store_admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

ALTER TABLE public.store_admin_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_admin_permissions_select_self" ON public.store_admin_permissions;
CREATE POLICY "store_admin_permissions_select_self"
  ON public.store_admin_permissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_store_permission(requested_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.store_users su
    JOIN public.store_admin_permissions sap
      ON sap.user_id = su.id
    WHERE su.id = auth.uid()
      AND su.store_role = 'ADMIN'
      AND sap.permission_key = requested_permission
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_store_permission(TEXT) TO authenticated;

-- Restrict direct Store user/access management to designated permission managers.
DROP POLICY IF EXISTS "store_users_admin_insert" ON public.store_users;
DROP POLICY IF EXISTS "store_users_admin_update" ON public.store_users;
DROP POLICY IF EXISTS "store_users_admin_delete" ON public.store_users;

CREATE POLICY "store_users_admin_insert"
  ON public.store_users
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_store_permission('permissions_manage'));

CREATE POLICY "store_users_admin_update"
  ON public.store_users
  FOR UPDATE
  TO authenticated
  USING (public.has_store_permission('permissions_manage'))
  WITH CHECK (public.has_store_permission('permissions_manage'));

CREATE POLICY "store_users_admin_delete"
  ON public.store_users
  FOR DELETE
  TO authenticated
  USING (public.has_store_permission('permissions_manage'));

-- Products remain visible to Store users/admins, but only product managers can mutate.
DROP POLICY IF EXISTS "store_products_admin_all" ON public.store_products;
CREATE POLICY "store_products_admin_all"
  ON public.store_products
  FOR ALL
  TO authenticated
  USING (public.has_store_permission('product_manage'))
  WITH CHECK (public.has_store_permission('product_manage'));

-- Stock data stays readable to admins, but only stock managers can mutate it.
DROP POLICY IF EXISTS "store_stock_entries_admin_all" ON public.store_stock_entries;
CREATE POLICY "store_stock_entries_admin_all"
  ON public.store_stock_entries
  FOR ALL
  TO authenticated
  USING (public.has_store_permission('stock_manage'))
  WITH CHECK (public.has_store_permission('stock_manage'));

DROP POLICY IF EXISTS "store_stock_movements_admin_all" ON public.store_stock_movements;
CREATE POLICY "store_stock_movements_admin_all"
  ON public.store_stock_movements
  FOR ALL
  TO authenticated
  USING (public.has_store_permission('stock_manage'))
  WITH CHECK (public.has_store_permission('stock_manage'));

-- Invoices stay readable to all admins, but only invoice managers can reverse/update/delete.
DROP POLICY IF EXISTS "store_invoices_update_admin" ON public.store_invoices;
DROP POLICY IF EXISTS "store_invoices_delete_admin" ON public.store_invoices;

CREATE POLICY "store_invoices_update_admin"
  ON public.store_invoices
  FOR UPDATE
  TO authenticated
  USING (public.has_store_permission('invoice_manage'))
  WITH CHECK (public.has_store_permission('invoice_manage'));

CREATE POLICY "store_invoices_delete_admin"
  ON public.store_invoices
  FOR DELETE
  TO authenticated
  USING (public.has_store_permission('invoice_manage'));

DROP POLICY IF EXISTS "store_invoice_items_update_admin" ON public.store_invoice_items;
DROP POLICY IF EXISTS "store_invoice_items_delete_admin" ON public.store_invoice_items;

CREATE POLICY "store_invoice_items_update_admin"
  ON public.store_invoice_items
  FOR UPDATE
  TO authenticated
  USING (public.has_store_permission('invoice_manage'))
  WITH CHECK (public.has_store_permission('invoice_manage'));

CREATE POLICY "store_invoice_items_delete_admin"
  ON public.store_invoice_items
  FOR DELETE
  TO authenticated
  USING (public.has_store_permission('invoice_manage'));

-- Balance entries and month closure actions are reserved for finance-capable admins.
DROP POLICY IF EXISTS "store_account_entries_insert_admin" ON public.store_account_entries;
DROP POLICY IF EXISTS "store_account_entries_update_admin" ON public.store_account_entries;
DROP POLICY IF EXISTS "store_account_entries_delete_admin" ON public.store_account_entries;

CREATE POLICY "store_account_entries_insert_admin"
  ON public.store_account_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_store_permission('balance_add'));

CREATE POLICY "store_account_entries_update_admin"
  ON public.store_account_entries
  FOR UPDATE
  TO authenticated
  USING (public.has_store_permission('balance_add'))
  WITH CHECK (public.has_store_permission('balance_add'));

CREATE POLICY "store_account_entries_delete_admin"
  ON public.store_account_entries
  FOR DELETE
  TO authenticated
  USING (public.has_store_permission('balance_add'));

DROP POLICY IF EXISTS "store_month_closures_admin_all" ON public.store_month_closures;
CREATE POLICY "store_month_closures_admin_all"
  ON public.store_month_closures
  FOR ALL
  TO authenticated
  USING (public.has_store_permission('balance_add'))
  WITH CHECK (public.has_store_permission('balance_add'));

DROP POLICY IF EXISTS "store_owner_month_closures_admin_all" ON public.store_owner_month_closures;
CREATE POLICY "store_owner_month_closures_admin_all"
  ON public.store_owner_month_closures
  FOR ALL
  TO authenticated
  USING (public.has_store_permission('balance_add'))
  WITH CHECK (public.has_store_permission('balance_add'));

-- Owner purchase records stay readable to admins, but only selected managers can edit them.
DROP POLICY IF EXISTS "store_owner_purchases_admin_all" ON public.store_owner_purchases;

CREATE POLICY "store_owner_purchases_insert_admin"
  ON public.store_owner_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_store_permission('owner_purchase_manage'));

CREATE POLICY "store_owner_purchases_update_admin"
  ON public.store_owner_purchases
  FOR UPDATE
  TO authenticated
  USING (public.has_store_permission('owner_purchase_manage'))
  WITH CHECK (public.has_store_permission('owner_purchase_manage'));

CREATE POLICY "store_owner_purchases_delete_admin"
  ON public.store_owner_purchases
  FOR DELETE
  TO authenticated
  USING (public.has_store_permission('owner_purchase_manage'));

-- Ensure the requested people are Store admins when they already exist as users.
INSERT INTO public.store_users (id, store_role)
SELECT au.id, 'ADMIN'::public.store_role
FROM auth.users au
WHERE au.id IN (
  'd2071e50-1df7-4a8f-95fc-1b72c96e52c0',
  '1b47fdf6-1bbc-4ff2-a7b6-414a7d088629',
  'e06c8e56-660f-4337-950d-629a12621363',
  '43a33217-066a-4d28-b71a-4d7b092162b4'
)
ON CONFLICT (id) DO UPDATE
SET store_role = EXCLUDED.store_role,
    updated_at = now();

INSERT INTO public.store_admin_permissions (user_id, permission_key, granted_by)
SELECT assignment.user_id, assignment.permission_key, assignment.granted_by
FROM (
  VALUES
    ('d2071e50-1df7-4a8f-95fc-1b72c96e52c0'::uuid, 'owner_purchase_manage'::text, 'd2071e50-1df7-4a8f-95fc-1b72c96e52c0'::uuid),
    ('d2071e50-1df7-4a8f-95fc-1b72c96e52c0'::uuid, 'balance_add'::text, 'd2071e50-1df7-4a8f-95fc-1b72c96e52c0'::uuid),
    ('d2071e50-1df7-4a8f-95fc-1b72c96e52c0'::uuid, 'permissions_manage'::text, 'd2071e50-1df7-4a8f-95fc-1b72c96e52c0'::uuid),
    ('1b47fdf6-1bbc-4ff2-a7b6-414a7d088629'::uuid, 'balance_add'::text, 'd2071e50-1df7-4a8f-95fc-1b72c96e52c0'::uuid),
    ('e06c8e56-660f-4337-950d-629a12621363'::uuid, 'stock_manage'::text, 'd2071e50-1df7-4a8f-95fc-1b72c96e52c0'::uuid),
    ('e06c8e56-660f-4337-950d-629a12621363'::uuid, 'product_manage'::text, 'd2071e50-1df7-4a8f-95fc-1b72c96e52c0'::uuid),
    ('e06c8e56-660f-4337-950d-629a12621363'::uuid, 'invoice_manage'::text, 'd2071e50-1df7-4a8f-95fc-1b72c96e52c0'::uuid),
    -- Local seed admin keeps broad access for development verification
    ('43a33217-066a-4d28-b71a-4d7b092162b4'::uuid, 'owner_purchase_manage'::text, '43a33217-066a-4d28-b71a-4d7b092162b4'::uuid),
    ('43a33217-066a-4d28-b71a-4d7b092162b4'::uuid, 'balance_add'::text, '43a33217-066a-4d28-b71a-4d7b092162b4'::uuid),
    ('43a33217-066a-4d28-b71a-4d7b092162b4'::uuid, 'stock_manage'::text, '43a33217-066a-4d28-b71a-4d7b092162b4'::uuid),
    ('43a33217-066a-4d28-b71a-4d7b092162b4'::uuid, 'product_manage'::text, '43a33217-066a-4d28-b71a-4d7b092162b4'::uuid),
    ('43a33217-066a-4d28-b71a-4d7b092162b4'::uuid, 'invoice_manage'::text, '43a33217-066a-4d28-b71a-4d7b092162b4'::uuid),
    ('43a33217-066a-4d28-b71a-4d7b092162b4'::uuid, 'permissions_manage'::text, '43a33217-066a-4d28-b71a-4d7b092162b4'::uuid)
) AS assignment(user_id, permission_key, granted_by)
JOIN auth.users au ON au.id = assignment.user_id
ON CONFLICT (user_id, permission_key) DO NOTHING;

NOTIFY pgrst, 'reload schema';

COMMIT;

DO $$
BEGIN
  RAISE NOTICE '✅ Added Store admin permission matrix';
  RAISE NOTICE '✅ Store admin mutations now support manual capability assignment';
END $$;
