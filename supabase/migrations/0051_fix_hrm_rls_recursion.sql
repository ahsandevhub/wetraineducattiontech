-- Migration: Fix infinite recursion in hrm_users RLS policies
-- Date: 2026-02-26
-- Issue: Policy was querying hrm_users within the policy for hrm_users, causing infinite recursion
-- Solution: Use SECURITY DEFINER function to bypass RLS when checking user's own role

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "hrm_users_select_own_or_admin" ON public.hrm_users;
DROP POLICY IF EXISTS "hrm_super_admin_all" ON public.hrm_users;

-- Create a security definer function in public schema (simpler solution - just check if user record exists)
-- This bypasses RLS by using a trusted query without recursive table lookup
CREATE OR REPLACE FUNCTION public.get_my_hrm_role()
RETURNS public.hrm_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT hrm_role FROM public.hrm_users WHERE id = auth.uid() LIMIT 1;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_my_hrm_role() TO authenticated;

-- Create non-recursive policies

-- 1. Users can always see their own record
CREATE POLICY "hrm_users_select_own"
  ON public.hrm_users FOR SELECT
  USING (id = auth.uid());

-- 2. SUPER_ADMIN and ADMIN can see all records (using the function to avoid recursion)
CREATE POLICY "hrm_users_select_admin"
  ON public.hrm_users FOR SELECT
  USING (public.get_my_hrm_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- 3. SUPER_ADMIN can insert (using the function)
CREATE POLICY "hrm_users_insert_super"
  ON public.hrm_users FOR INSERT
  WITH CHECK (public.get_my_hrm_role() = 'SUPER_ADMIN');

-- 4. SUPER_ADMIN can update all
CREATE POLICY "hrm_users_update_super"
  ON public.hrm_users FOR UPDATE
  USING (public.get_my_hrm_role() = 'SUPER_ADMIN')
  WITH CHECK (public.get_my_hrm_role() = 'SUPER_ADMIN');

-- 5. SUPER_ADMIN can delete
CREATE POLICY "hrm_users_delete_super"
  ON public.hrm_users FOR DELETE
  USING (public.get_my_hrm_role() = 'SUPER_ADMIN');

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed infinite recursion in hrm_users RLS policies';
  RAISE NOTICE '✅ Created SECURITY DEFINER function: auth.get_my_hrm_role()';
END $$;
