-- Migration: Create Store module schema
-- Date: 2026-04-10
-- Purpose: Add the internal cafeteria/store foundation tables, enums, and indexes

-- 1) Enums
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'store_role'
  ) THEN
    CREATE TYPE public.store_role AS ENUM ('USER', 'ADMIN');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'store_invoice_status'
  ) THEN
    CREATE TYPE public.store_invoice_status AS ENUM ('CONFIRMED', 'REVERSED');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'store_stock_movement_type'
  ) THEN
    CREATE TYPE public.store_stock_movement_type AS ENUM (
      'RESTOCK',
      'SALE',
      'ADJUSTMENT',
      'REVERSAL'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'store_account_entry_category'
  ) THEN
    CREATE TYPE public.store_account_entry_category AS ENUM (
      'MONTHLY_ALLOCATION',
      'EMPLOYEE_PAYMENT',
      'PURCHASE',
      'REFUND',
      'REVERSAL',
      'CORRECTION',
      'PENALTY',
      'BONUS_OR_REWARD',
      'OTHER'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'store_month_status'
  ) THEN
    CREATE TYPE public.store_month_status AS ENUM ('OPEN', 'CLOSED');
  END IF;
END $$;

-- 2) Store access table
CREATE TABLE IF NOT EXISTS public.store_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_role public.store_role NOT NULL DEFAULT 'USER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Product catalog
CREATE TABLE IF NOT EXISTS public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  tracks_stock BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4) Inbound stock entries for admin restocking
CREATE TABLE IF NOT EXISTS public.store_stock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.store_products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(10, 2) CHECK (unit_cost IS NULL OR unit_cost >= 0),
  note TEXT,
  reference_type TEXT,
  reference_number TEXT,
  entered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) Invoice headers
CREATE TABLE IF NOT EXISTS public.store_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  month_key DATE NOT NULL DEFAULT date_trunc('month', now())::date,
  status public.store_invoice_status NOT NULL DEFAULT 'CONFIRMED',
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reversed_at TIMESTAMPTZ,
  reversed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reversal_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT store_invoices_month_key_is_month_start
    CHECK (month_key = date_trunc('month', month_key::timestamp)::date)
);

-- 6) Invoice items
CREATE TABLE IF NOT EXISTS public.store_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.store_invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.store_products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7) Stock movements (append-only stock ledger)
CREATE TABLE IF NOT EXISTS public.store_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.store_products(id) ON DELETE RESTRICT,
  stock_entry_id UUID REFERENCES public.store_stock_entries(id) ON DELETE SET NULL,
  invoice_item_id UUID REFERENCES public.store_invoice_items(id) ON DELETE SET NULL,
  reversed_from_movement_id UUID REFERENCES public.store_stock_movements(id) ON DELETE SET NULL,
  movement_type public.store_stock_movement_type NOT NULL,
  quantity_delta INTEGER NOT NULL CHECK (quantity_delta <> 0),
  reason TEXT,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8) Account ledger (append-only balance history)
CREATE TABLE IF NOT EXISTS public.store_account_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  month_key DATE NOT NULL DEFAULT date_trunc('month', now())::date,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount <> 0),
  category public.store_account_entry_category NOT NULL,
  reason TEXT NOT NULL,
  invoice_id UUID REFERENCES public.store_invoices(id) ON DELETE SET NULL,
  reversed_from_entry_id UUID REFERENCES public.store_account_entries(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT store_account_entries_month_key_is_month_start
    CHECK (month_key = date_trunc('month', month_key::timestamp)::date)
);

-- 9) Month closures and carry-forward snapshots
CREATE TABLE IF NOT EXISTS public.store_month_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key DATE NOT NULL UNIQUE,
  status public.store_month_status NOT NULL DEFAULT 'OPEN',
  opening_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  closing_balance NUMERIC(10, 2),
  closed_at TIMESTAMPTZ,
  closed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT store_month_closures_month_key_is_month_start
    CHECK (month_key = date_trunc('month', month_key::timestamp)::date)
);

-- 10) Indexes
CREATE INDEX IF NOT EXISTS idx_store_users_store_role
  ON public.store_users(store_role);

CREATE INDEX IF NOT EXISTS idx_store_products_name
  ON public.store_products(name);

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_products_sku_unique
  ON public.store_products(sku)
  WHERE sku IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_products_barcode_unique
  ON public.store_products(barcode)
  WHERE barcode IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_store_products_active
  ON public.store_products(is_active);

CREATE INDEX IF NOT EXISTS idx_store_stock_entries_product_id
  ON public.store_stock_entries(product_id);

CREATE INDEX IF NOT EXISTS idx_store_invoices_user_month
  ON public.store_invoices(user_id, month_key, confirmed_at DESC);

CREATE INDEX IF NOT EXISTS idx_store_invoices_status
  ON public.store_invoices(status);

CREATE INDEX IF NOT EXISTS idx_store_invoice_items_invoice_id
  ON public.store_invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_store_invoice_items_product_id
  ON public.store_invoice_items(product_id);

CREATE INDEX IF NOT EXISTS idx_store_stock_movements_product_created
  ON public.store_stock_movements(product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_store_stock_movements_type
  ON public.store_stock_movements(movement_type);

CREATE INDEX IF NOT EXISTS idx_store_account_entries_user_month
  ON public.store_account_entries(user_id, month_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_store_account_entries_category
  ON public.store_account_entries(category);

CREATE INDEX IF NOT EXISTS idx_store_month_closures_month_key
  ON public.store_month_closures(month_key DESC);

-- 11) updated_at triggers (reuse shared helper)
DROP TRIGGER IF EXISTS update_store_users_updated_at ON public.store_users;
CREATE TRIGGER update_store_users_updated_at
  BEFORE UPDATE ON public.store_users
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

DROP TRIGGER IF EXISTS update_store_products_updated_at ON public.store_products;
CREATE TRIGGER update_store_products_updated_at
  BEFORE UPDATE ON public.store_products
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

DROP TRIGGER IF EXISTS update_store_stock_entries_updated_at ON public.store_stock_entries;
CREATE TRIGGER update_store_stock_entries_updated_at
  BEFORE UPDATE ON public.store_stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

DROP TRIGGER IF EXISTS update_store_invoices_updated_at ON public.store_invoices;
CREATE TRIGGER update_store_invoices_updated_at
  BEFORE UPDATE ON public.store_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

DROP TRIGGER IF EXISTS update_store_account_entries_updated_at ON public.store_account_entries;
CREATE TRIGGER update_store_account_entries_updated_at
  BEFORE UPDATE ON public.store_account_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

DROP TRIGGER IF EXISTS update_store_month_closures_updated_at ON public.store_month_closures;
CREATE TRIGGER update_store_month_closures_updated_at
  BEFORE UPDATE ON public.store_month_closures
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

-- 12) Refresh schema cache
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ Created Store module schema';
  RAISE NOTICE '✅ Added Store enums, tables, and indexes';
END $$;
