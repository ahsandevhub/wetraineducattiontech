-- Recreate all RLS policies after is_admin() function was updated
-- All policies now use the SECURITY DEFINER is_admin() function

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles select own or admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles insert own" ON public.profiles;
DROP POLICY IF EXISTS "profiles update own no role change" ON public.profiles;
DROP POLICY IF EXISTS "profiles admin update" ON public.profiles;

DROP POLICY IF EXISTS "services select all" ON public.services;
DROP POLICY IF EXISTS "services_admin_all" ON public.services;

DROP POLICY IF EXISTS "projects select all" ON public.featured_projects;
DROP POLICY IF EXISTS "projects_admin_all" ON public.featured_projects;

DROP POLICY IF EXISTS "certifications select all" ON public.certifications;
DROP POLICY IF EXISTS "certifications_admin_all" ON public.certifications;

DROP POLICY IF EXISTS "stories select all" ON public.client_stories;
DROP POLICY IF EXISTS "stories_admin_all" ON public.client_stories;

DROP POLICY IF EXISTS "orders select own or admin" ON public.orders;
DROP POLICY IF EXISTS "orders insert own" ON public.orders;
DROP POLICY IF EXISTS "orders update own or admin" ON public.orders;
DROP POLICY IF EXISTS "orders delete own or admin" ON public.orders;

DROP POLICY IF EXISTS "payments select own or admin" ON public.payments;
DROP POLICY IF EXISTS "payments insert own" ON public.payments;
DROP POLICY IF EXISTS "payments update own or admin" ON public.payments;
DROP POLICY IF EXISTS "payments delete own or admin" ON public.payments;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "profiles select own or admin" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles insert own" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles update own no role change" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles admin update" ON public.profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- SERVICES POLICIES - Anyone can read
-- ============================================
CREATE POLICY "services select all" ON public.services
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "services_admin_all" ON public.services
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- FEATURED PROJECTS POLICIES
-- ============================================
CREATE POLICY "projects select all" ON public.featured_projects
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "projects_admin_all" ON public.featured_projects
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- CERTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "certifications select all" ON public.certifications
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "certifications_admin_all" ON public.certifications
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- CLIENT STORIES POLICIES
-- ============================================
CREATE POLICY "stories select all" ON public.client_stories
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "stories_admin_all" ON public.client_stories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================
-- ORDERS POLICIES
-- ============================================
CREATE POLICY "orders select own or admin" ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR public.is_admin()
  );

CREATE POLICY "orders insert own" ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders update own or admin" ON public.orders
  FOR UPDATE
  USING (
    user_id = auth.uid() 
    OR public.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR public.is_admin()
  );

CREATE POLICY "orders delete own or admin" ON public.orders
  FOR DELETE
  USING (
    user_id = auth.uid() 
    OR public.is_admin()
  );

-- ============================================
-- PAYMENTS POLICIES
-- ============================================
CREATE POLICY "payments select own or admin" ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR public.is_admin()
  );

CREATE POLICY "payments insert own" ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "payments update own or admin" ON public.payments
  FOR UPDATE
  USING (
    user_id = auth.uid() 
    OR public.is_admin()
  )
  WITH CHECK (
    user_id = auth.uid() 
    OR public.is_admin()
  );

CREATE POLICY "payments delete own or admin" ON public.payments
  FOR DELETE
  USING (
    user_id = auth.uid() 
    OR public.is_admin()
  );
