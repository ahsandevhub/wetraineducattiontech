-- Re-enable RLS on orders and payments.
-- Earlier migration 0022 disabled RLS, and later policy fixes recreated policies
-- without switching the row security flag back on.

ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;

-- Remove duplicate legacy insert policies if they still exist.
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
