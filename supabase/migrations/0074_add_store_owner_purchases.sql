-- Migration: Add Store owner purchase tracking
-- Date: 2026-04-14
-- Purpose: Add a standalone owner-level monthly purchase tracker for Store admins

-- 1) Owner purchase entries
CREATE TABLE IF NOT EXISTS public.store_owner_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  month_key DATE NOT NULL DEFAULT date_trunc('month', now())::date,
  title TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  vendor TEXT,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT store_owner_purchases_month_key_is_month_start
    CHECK (month_key = date_trunc('month', month_key::timestamp)::date)
);

-- 2) Owner month snapshots and carry-forward
CREATE TABLE IF NOT EXISTS public.store_owner_month_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key DATE NOT NULL UNIQUE,
  status public.store_month_status NOT NULL DEFAULT 'OPEN',
  opening_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  closing_amount NUMERIC(10, 2),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT store_owner_month_closures_month_key_is_month_start
    CHECK (month_key = date_trunc('month', month_key::timestamp)::date)
);

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_store_owner_purchases_month_created
  ON public.store_owner_purchases(month_key, purchase_date DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_store_owner_purchases_title
  ON public.store_owner_purchases(title);

CREATE INDEX IF NOT EXISTS idx_store_owner_month_closures_month_key
  ON public.store_owner_month_closures(month_key DESC);

-- 4) updated_at triggers
DROP TRIGGER IF EXISTS update_store_owner_purchases_updated_at
  ON public.store_owner_purchases;
CREATE TRIGGER update_store_owner_purchases_updated_at
  BEFORE UPDATE ON public.store_owner_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

DROP TRIGGER IF EXISTS update_store_owner_month_closures_updated_at
  ON public.store_owner_month_closures;
CREATE TRIGGER update_store_owner_month_closures_updated_at
  BEFORE UPDATE ON public.store_owner_month_closures
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

-- 5) RLS
ALTER TABLE public.store_owner_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_owner_month_closures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_owner_purchases_select_admin"
  ON public.store_owner_purchases;
DROP POLICY IF EXISTS "store_owner_purchases_admin_all"
  ON public.store_owner_purchases;
DROP POLICY IF EXISTS "store_owner_month_closures_select_admin"
  ON public.store_owner_month_closures;
DROP POLICY IF EXISTS "store_owner_month_closures_admin_all"
  ON public.store_owner_month_closures;

CREATE POLICY "store_owner_purchases_select_admin"
  ON public.store_owner_purchases
  FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

CREATE POLICY "store_owner_purchases_admin_all"
  ON public.store_owner_purchases
  FOR ALL
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

CREATE POLICY "store_owner_month_closures_select_admin"
  ON public.store_owner_month_closures
  FOR SELECT
  TO authenticated
  USING (public.is_store_admin());

CREATE POLICY "store_owner_month_closures_admin_all"
  ON public.store_owner_month_closures
  FOR ALL
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

-- 6) Refresh schema cache
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ Added Store owner purchase tracker tables';
  RAISE NOTICE '✅ Added standalone owner month snapshots and RLS policies';
END $$;
