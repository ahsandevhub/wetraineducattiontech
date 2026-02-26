-- Migration: Fix crm_lead_requests RLS policies
-- Date: 2026-02-26
-- Problem: RLS policies reference auth_user_id which no longer exists in
--          crm_users after migration 0048.
-- Fix: Update policies to use id = auth.uid() directly since crm_users.id = auth.users.id

-- Drop all existing policies for crm_lead_requests
DROP POLICY IF EXISTS "crm_lead_requests_marketer_insert" ON crm_lead_requests;
DROP POLICY IF EXISTS "crm_lead_requests_marketer_select" ON crm_lead_requests;
DROP POLICY IF EXISTS "crm_lead_requests_admin_select" ON crm_lead_requests;
DROP POLICY IF EXISTS "crm_lead_requests_admin_update" ON crm_lead_requests;
DROP POLICY IF EXISTS "crm_lead_requests_admin_delete" ON crm_lead_requests;

-- Policy: Marketers can insert their own requests
-- requester_id must equal current user (since crm_users.id = auth.users.id)
CREATE POLICY crm_lead_requests_marketer_insert 
  ON crm_lead_requests
  FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Policy: Marketers can view their own requests
CREATE POLICY crm_lead_requests_marketer_select 
  ON crm_lead_requests
  FOR SELECT
  USING (requester_id = auth.uid());

-- Policy: Admins can view all requests
CREATE POLICY crm_lead_requests_admin_select 
  ON crm_lead_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crm_users 
      WHERE crm_users.id = auth.uid() 
      AND crm_users.crm_role = 'ADMIN'
    )
  );

-- Policy: Admins can update requests (review/approve/decline)
CREATE POLICY crm_lead_requests_admin_update 
  ON crm_lead_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM crm_users 
      WHERE crm_users.id = auth.uid() 
      AND crm_users.crm_role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM crm_users 
      WHERE crm_users.id = auth.uid() 
      AND crm_users.crm_role = 'ADMIN'
    )
  );

-- Policy: Admins can delete requests
CREATE POLICY crm_lead_requests_admin_delete 
  ON crm_lead_requests
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM crm_users 
      WHERE crm_users.id = auth.uid() 
      AND crm_users.crm_role = 'ADMIN'
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Fixed crm_lead_requests RLS policies for new crm_users schema';
END $$;
