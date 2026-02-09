-- Comprehensive RLS policy fixes for ALL tables
-- This ensures all authenticated users can read public data and manage their own records

-- Drop all existing policies
DO $$
BEGIN
  -- Services policies
  EXECUTE 'DROP POLICY IF EXISTS "services select all" ON public.services';
  EXECUTE 'DROP POLICY IF EXISTS "services admin" ON public.services';
  
  -- Featured Projects policies
  EXECUTE 'DROP POLICY IF EXISTS "projects select all" ON public.featured_projects';
  EXECUTE 'DROP POLICY IF EXISTS "projects admin" ON public.featured_projects';
  
  -- Certifications policies
  EXECUTE 'DROP POLICY IF EXISTS "certifications select all" ON public.certifications';
  EXECUTE 'DROP POLICY IF EXISTS "certifications admin" ON public.certifications';
  
  -- Client Stories policies
  EXECUTE 'DROP POLICY IF EXISTS "stories select all" ON public.client_stories';
  EXECUTE 'DROP POLICY IF EXISTS "stories admin" ON public.client_stories';
  
  -- Orders policies
  EXECUTE 'DROP POLICY IF EXISTS "orders select own or admin" ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS "orders insert own" ON public.orders';
  EXECUTE 'DROP POLICY IF EXISTS "orders update own or admin" ON public.orders';
  
  -- Payments policies
  EXECUTE 'DROP POLICY IF EXISTS "payments select own or admin" ON public.payments';
  EXECUTE 'DROP POLICY IF EXISTS "payments insert own" ON public.payments';
  EXECUTE 'DROP POLICY IF EXISTS "payments update own or admin" ON public.payments';
  
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on all tables
ALTER TABLE IF EXISTS public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.featured_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SERVICES - Public read, admin write
-- ============================================
CREATE POLICY "services select all" ON public.services
  FOR SELECT
  USING (true);

CREATE POLICY "services admin insert" ON public.services
  FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "services admin update" ON public.services
  FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "services admin delete" ON public.services
  FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================
-- FEATURED PROJECTS - Public read, admin write
-- ============================================
CREATE POLICY "projects select all" ON public.featured_projects
  FOR SELECT
  USING (true);

CREATE POLICY "projects admin insert" ON public.featured_projects
  FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "projects admin update" ON public.featured_projects
  FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "projects admin delete" ON public.featured_projects
  FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================
-- CERTIFICATIONS - Public read, admin write
-- ============================================
CREATE POLICY "certifications select all" ON public.certifications
  FOR SELECT
  USING (true);

CREATE POLICY "certifications admin insert" ON public.certifications
  FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "certifications admin update" ON public.certifications
  FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "certifications admin delete" ON public.certifications
  FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================
-- CLIENT STORIES - Public read, admin write
-- ============================================
CREATE POLICY "stories select all" ON public.client_stories
  FOR SELECT
  USING (true);

CREATE POLICY "stories admin insert" ON public.client_stories
  FOR INSERT
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "stories admin update" ON public.client_stories
  FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "stories admin delete" ON public.client_stories
  FOR DELETE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- ============================================
-- ORDERS - Own records OR admin
-- ============================================
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

CREATE POLICY "orders delete own or admin" ON public.orders
  FOR DELETE
  USING (
    user_id = auth.uid() 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- PAYMENTS - Own records OR admin
-- ============================================
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

CREATE POLICY "payments delete own or admin" ON public.payments
  FOR DELETE
  USING (
    user_id = auth.uid() 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
