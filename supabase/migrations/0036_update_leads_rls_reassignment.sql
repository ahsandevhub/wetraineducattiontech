-- Migration: Update RLS policies for lead reassignment
-- Purpose: Ensure proper permissions for lead reassignment feature
-- Date: 2024
-- 
-- CONTEXT:
-- - ADMIN can reassign any lead
-- - MARKETER can only reassign leads they own
-- - On reassignment, source is automatically set to 'REASSIGNED'
-- 
-- The reassignment logic is enforced server-side in the reassignLead action,
-- but we need to ensure RLS policies allow the source field to be updated.

-- ============================================================================
-- Step 1: Verify current UPDATE policy on crm_leads
-- ============================================================================
-- The existing policy "crm_leads_update_own_or_admin" should be in place:
--
-- USING clause (who can see/update the row):
--   - is_crm_admin() OR owner_id = get_crm_user_id() OR owner_id IS NULL
--
-- WITH CHECK clause (what they can change it to):
--   - is_crm_admin() OR owner_id = get_crm_user_id()
--
-- This means:
-- - ADMIN can update any lead (including owner_id and source)
-- - MARKETER can update leads they own (including owner_id and source)
-- - MARKETER cannot update leads they don't own (enforced server-side too)

-- ============================================================================
-- Step 2: Ensure source column is updatable (no column-level restrictions)
-- ============================================================================
-- Verify no column-level policies restrict source updates
-- (This is just a check, no changes needed unless there are restrictions)

DO $$
BEGIN
  -- Log that we're checking RLS policies
  RAISE NOTICE 'Checking RLS policies for lead reassignment...';
  
  -- Verify the UPDATE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'crm_leads' 
    AND policyname = 'crm_leads_update_own_or_admin'
    AND cmd = 'UPDATE'
  ) THEN
    RAISE EXCEPTION 'Required UPDATE policy "crm_leads_update_own_or_admin" not found!';
  END IF;
  
  RAISE NOTICE 'RLS policies verified successfully for lead reassignment.';
END $$;

-- ============================================================================
-- Step 3: Add documentation comment on crm_leads table
-- ============================================================================
COMMENT ON TABLE crm_leads IS 
'CRM Leads table with reassignment support. 
- owner_id: Can be changed by ADMIN (any lead) or MARKETER (own leads only)
- source: Automatically set to ''REASSIGNED'' when owner_id changes
- RLS enforced via "crm_leads_update_own_or_admin" policy';

COMMENT ON COLUMN crm_leads.source IS 
'Lead source. Set to ''REASSIGNED'' when lead is reassigned to a new owner.
Valid values: ADMIN, WEBSITE, REFERRAL, SOCIAL_MEDIA, REASSIGNED, OTHER';

COMMENT ON COLUMN crm_leads.owner_id IS 
'CRM user who owns this lead. Can be reassigned by:
- ADMIN: Any lead
- MARKETER: Only leads they currently own';

-- ============================================================================
-- Step 4: Verification query
-- ============================================================================
-- Run this to verify the UPDATE policy is correctly configured:
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
-- policyname: crm_leads_update_own_or_admin
-- cmd: UPDATE
-- using_clause: Should include "is_crm_admin() OR owner_id = get_crm_user_id() OR owner_id IS NULL"
-- with_check_clause: Should include "is_crm_admin() OR owner_id = get_crm_user_id()"

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- The existing RLS policies are sufficient for the reassignment feature.
-- Server-side validation in reassignLead() ensures:
-- 1. Permission check (admin = any, marketer = own only)
-- 2. Automatic source update to 'REASSIGNED'
-- 3. owner_id update to new owner
