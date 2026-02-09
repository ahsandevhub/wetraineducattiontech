-- Drop ALL existing policies completely and recreate them with simpler logic
-- This ensures clean slate without conflicts

-- Drop all policies on all tables
DROP POLICY IF EXISTS "services select all" ON public.services;
DROP POLICY IF EXISTS "services admin insert" ON public.services;
DROP POLICY IF EXISTS "services admin update" ON public.services;
DROP POLICY IF EXISTS "services admin delete" ON public.services;

DROP POLICY IF EXISTS "projects select all" ON public.featured_projects;
DROP POLICY IF EXISTS "projects admin insert" ON public.featured_projects;
DROP POLICY IF EXISTS "projects admin update" ON public.featured_projects;
DROP POLICY IF EXISTS "projects admin delete" ON public.featured_projects;

DROP POLICY IF EXISTS "certifications select all" ON public.certifications;
DROP POLICY IF EXISTS "certifications admin insert" ON public.certifications;
DROP POLICY IF EXISTS "certifications admin update" ON public.certifications;
DROP POLICY IF EXISTS "certifications admin delete" ON public.certifications;

DROP POLICY IF EXISTS "stories select all" ON public.client_stories;
DROP POLICY IF EXISTS "stories admin insert" ON public.client_stories;
DROP POLICY IF EXISTS "stories admin update" ON public.client_stories;
DROP POLICY IF EXISTS "stories admin delete" ON public.client_stories;

DROP POLICY IF EXISTS "orders select own or admin" ON public.orders;
DROP POLICY IF EXISTS "orders insert own" ON public.orders;
DROP POLICY IF EXISTS "orders update own or admin" ON public.orders;
DROP POLICY IF EXISTS "orders delete own or admin" ON public.orders;

DROP POLICY IF EXISTS "payments select own or admin" ON public.payments;
DROP POLICY IF EXISTS "payments insert own" ON public.payments;
DROP POLICY IF EXISTS "payments update own or admin" ON public.payments;
DROP POLICY IF EXISTS "payments delete own or admin" ON public.payments;

-- ============================================
-- SERVICES - Anyone can read (even anon)
-- ============================================
CREATE POLICY "services_select_all" ON public.services
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "services_admin_all" ON public.services
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- FEATURED PROJECTS - Anyone can read
-- ============================================
CREATE POLICY "projects_select_all" ON public.featured_projects
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "projects_admin_all" ON public.featured_projects
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- CERTIFICATIONS - Anyone can read
-- ============================================
CREATE POLICY "certifications_select_all" ON public.certifications
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "certifications_admin_all" ON public.certifications
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- CLIENT STORIES - Anyone can read
-- ============================================
CREATE POLICY "stories_select_all" ON public.client_stories
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "stories_admin_all" ON public.client_stories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- ORDERS - Own records OR admin
-- ============================================
CREATE POLICY "orders_select_own_or_admin" ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR public.is_admin()
  );

CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_all_admin" ON public.orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- PAYMENTS - Own records OR admin
-- ============================================
CREATE POLICY "payments_select_own_or_admin" ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR public.is_admin()
  );

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "payments_all_admin" ON public.payments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
