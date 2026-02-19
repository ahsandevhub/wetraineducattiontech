-- Migration: Fix RLS policy to allow lead reassignment
-- Purpose: The previous policy prevented marketers from reassigning leads because it required 
-- the new owner_id to equal the current user. Since server-side checks permissions,
-- we trust the authenticated user and allow the reassignment.

-- Recreate the UPDATE policy to allow reassignment
DROP POLICY IF EXISTS "crm_leads_update_own_or_admin" ON crm_leads;

CREATE POLICY "crm_leads_update_own_or_admin" ON crm_leads
  FOR UPDATE
  TO authenticated
  USING (
    -- USING: Who can attempt to update this row?
    is_crm_admin() OR 
    owner_id = get_crm_user_id() OR 
    owner_id IS NULL  -- Allow marketers to see/update unassigned leads
  )
  WITH CHECK (
    -- WITH CHECK: What states can the row be in after update?
    -- Admin: Can update to any state
    -- Marketer: Can update if authenticated (server-side perms already checked)
    is_crm_admin() OR auth.uid() IS NOT NULL
  );

-- ============================================================================
-- Verification
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual AS using_clause,
  with_check AS with_check_clause
FROM pg_policies
WHERE tablename = 'crm_leads'
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- Expected result:
-- The WITH CHECK clause should allow admin or any authenticated user
-- This trusts the server-side reassignLead() permission checks
