-- Disable RLS on orders and payments tables
-- These tables use app-level auth instead (admin dashboard checks role)
-- Keeping RLS enabled on public-facing tables (services, certifications, projects, stories)

ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- Drop all policies from orders and payments since RLS is disabled
DROP POLICY IF EXISTS "orders select own or admin" ON public.orders;
DROP POLICY IF EXISTS "orders insert own" ON public.orders;
DROP POLICY IF EXISTS "orders update own or admin" ON public.orders;
DROP POLICY IF EXISTS "orders delete own or admin" ON public.orders;

DROP POLICY IF EXISTS "payments select own or admin" ON public.payments;
DROP POLICY IF EXISTS "payments insert own" ON public.payments;
DROP POLICY IF EXISTS "payments update own or admin" ON public.payments;
DROP POLICY IF EXISTS "payments delete own or admin" ON public.payments;
