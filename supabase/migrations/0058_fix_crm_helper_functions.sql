-- Migration: Fix CRM helper functions for new schema
-- Date: 2026-02-26
-- Problem: is_crm_admin() and get_crm_user_id() still reference auth_user_id
--          and is_active columns that were removed in migration 0048.
--          These functions back every RLS policy on crm_leads, crm_contact_logs,
--          and crm_users, causing "column auth_user_id does not exist" on any
--          query touching those tables (charts, leads page, etc.).
-- Fix: Rewrite both functions using the new schema where crm_users.id = auth.uid()

-- is_crm_admin(): check if current auth user has ADMIN role in crm_users
CREATE OR REPLACE FUNCTION is_crm_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.crm_users
    WHERE id = auth.uid()
      AND crm_role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- get_crm_user_id(): return current auth user id if they exist in crm_users
CREATE OR REPLACE FUNCTION get_crm_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id
    FROM public.crm_users
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  RAISE NOTICE '✅ Fixed is_crm_admin() and get_crm_user_id() for new crm_users schema';
  RAISE NOTICE '✅ Removed references to auth_user_id and is_active';
END $$;
