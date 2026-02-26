-- Migration: Fix CRM RLS policies for new schema
-- Date: 2026-02-26
-- Problem: RLS policies reference auth_user_id and is_active columns that
--          no longer exist in crm_users after migration 0048. The old schema
--          had auth_user_id as a FK field; new schema has id = auth.users.id.
-- Fix: Drop old policies and recreate with correct column references.

-- ============================================================================
-- DROP OLD CRM_USERS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "crm_users_update_own" ON crm_users;
DROP POLICY IF EXISTS "crm_users_insert_service" ON crm_users;
DROP POLICY IF EXISTS "crm_users_delete_service" ON crm_users;

-- ============================================================================
-- DROP OLD CRM_LEADS POLICIES (references is_active and auth_user_id)
-- ============================================================================

DROP POLICY IF EXISTS "crm_leads_insert_authenticated" ON crm_leads;

-- Keep other crm_leads policies - they only reference owner_id and get_crm_user_id()

-- ============================================================================
-- RECREATE CRM_USERS POLICIES WITH CORRECT REFERENCES
-- ============================================================================

-- Users can update their own CRM profile (id = auth.uid(), no is_active check)
CREATE POLICY "crm_users_update_own" ON crm_users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid() 
    AND crm_role = (SELECT crm_role FROM crm_users WHERE id = auth.uid())
  );

-- Only service role can insert
CREATE POLICY "crm_users_insert_service" ON crm_users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service role can delete
CREATE POLICY "crm_users_delete_service" ON crm_users
  FOR DELETE
  TO service_role
  USING (true);

-- ============================================================================
-- RECREATE CRM_LEADS INSERT POLICY (remove is_active check)
-- ============================================================================

-- Authenticated users can insert leads (no is_active check; user either exists or doesn't)
CREATE POLICY "crm_leads_insert_authenticated" ON crm_leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM crm_users WHERE id = auth.uid())
  );

-- ============================================================================
-- MISSION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Fixed CRM RLS policies for new crm_users schema';
  RAISE NOTICE '✅ Removed references to auth_user_id and is_active';
  RAISE NOTICE '✅ Updated policies to use id = auth.uid() (new PK)';
END $$;
