-- Fix orders and payments RLS policies to allow admin access
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "orders select own or admin" ON public.orders;
DROP POLICY IF EXISTS "orders insert own" ON public.orders;
DROP POLICY IF EXISTS "orders update own or admin" ON public.orders;
DROP POLICY IF EXISTS "orders delete own or admin" ON public.orders;

DROP POLICY IF EXISTS "payments select own or admin" ON public.payments;
DROP POLICY IF EXISTS "payments insert own" ON public.payments;
DROP POLICY IF EXISTS "payments update own or admin" ON public.payments;
DROP POLICY IF EXISTS "payments delete own or admin" ON public.payments;

DROP POLICY IF EXISTS "orders select service role" ON public.orders;
DROP POLICY IF EXISTS "orders select own" ON public.orders;
DROP POLICY IF EXISTS "payments select service role" ON public.payments;
DROP POLICY IF EXISTS "payments select own" ON public.payments;

-- ORDERS - Admins can see all orders
CREATE POLICY "orders select admin" ON public.orders
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());

-- ORDERS - Service role bypass (for direct admin API calls)
CREATE POLICY "orders select service role" ON public.orders
  FOR SELECT
  USING (auth.role() = 'service_role');

-- PAYMENTS - Admins can see all payments  
CREATE POLICY "payments select admin" ON public.payments
  FOR SELECT
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());

-- PAYMENTS - Service role bypass
CREATE POLICY "payments select service role" ON public.payments
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Authenticated users can insert their own orders
CREATE POLICY "orders insert own" ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Authenticated users can insert their own payments
CREATE POLICY "payments insert own" ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Authenticated users can update orders (admins all, others own)
CREATE POLICY "orders update own or admin" ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid())
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- Authenticated users can update payments (admins all, others own)
CREATE POLICY "payments update own or admin" ON public.payments
  FOR UPDATE
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid())
  WITH CHECK (public.is_admin() OR user_id = auth.uid());

-- Authenticated users can delete orders (admins all, others own)
CREATE POLICY "orders delete own or admin" ON public.orders
  FOR DELETE
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());

-- Authenticated users can delete payments (admins all, others own)
CREATE POLICY "payments delete own or admin" ON public.payments
  FOR DELETE
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());

