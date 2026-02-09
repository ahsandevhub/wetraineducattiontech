-- Fix RLS policies for orders and payments tables
-- Ensure admin users can view all orders and payments

-- Drop existing policies if they exist
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "orders select own or admin" ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS "payments select own or admin" ON public.payments';
  EXECUTE 'DROP POLICY IF EXISTS "orders insert own" ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS "payments insert own" ON public.payments';
  EXECUTE 'DROP POLICY IF EXISTS "orders update own or admin" ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS "payments update own or admin" ON public.payments';
  EXECUTE 'ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN null;
END $$;

-- Create new RLS policies for orders
CREATE POLICY "orders select own or admin" ON public.orders
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "orders insert own" ON public.orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders update own or admin" ON public.orders
  FOR UPDATE
  USING (
    user_id = auth.uid() 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Create new RLS policies for payments
CREATE POLICY "payments select own or admin" ON public.payments
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "payments insert own" ON public.payments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "payments update own or admin" ON public.payments
  FOR UPDATE
  USING (
    user_id = auth.uid() 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
