-- Migration: Fix FK constraints to allow CRM user deletion without deleting leads
-- Date: 2026-02-17
-- Purpose: Change crm_leads.owner_id and crm_contact_logs.user_id to ON DELETE SET NULL
--          This allows CRM users to be deleted while preserving their leads as "unassigned"

-- ============================================================================
-- AUDIT: Document current constraints before modification
-- ============================================================================

DO $$
DECLARE
  leads_owner_constraint TEXT;
  logs_user_constraint TEXT;
BEGIN
  -- Get current FK constraint details for crm_leads.owner_id
  SELECT 
    pg_get_constraintdef(oid) INTO leads_owner_constraint
  FROM pg_constraint
  WHERE conname = 'crm_leads_owner_id_fkey';
  
  RAISE NOTICE 'Current crm_leads.owner_id FK: %', leads_owner_constraint;
  
  -- Get current FK constraint details for crm_contact_logs.user_id
  SELECT 
    pg_get_constraintdef(oid) INTO logs_user_constraint
  FROM pg_constraint
  WHERE conname = 'crm_contact_logs_user_id_fkey';
  
  RAISE NOTICE 'Current crm_contact_logs.user_id FK: %', logs_user_constraint;
  
  -- Check NOT NULL constraints
  RAISE NOTICE 'crm_leads.owner_id is NOT NULL: %', (
    SELECT attnotnull FROM pg_attribute 
    WHERE attrelid = 'crm_leads'::regclass AND attname = 'owner_id'
  );
  
  RAISE NOTICE 'crm_contact_logs.user_id is NOT NULL: %', (
    SELECT attnotnull FROM pg_attribute 
    WHERE attrelid = 'crm_contact_logs'::regclass AND attname = 'user_id'
  );
END $$;

-- ============================================================================
-- FIX 1: crm_leads.owner_id - Allow NULL and SET NULL on delete
-- ============================================================================

-- Step 1: Make owner_id nullable
ALTER TABLE public.crm_leads
  ALTER COLUMN owner_id DROP NOT NULL;

-- Step 2: Drop existing FK constraint
ALTER TABLE public.crm_leads
  DROP CONSTRAINT IF EXISTS crm_leads_owner_id_fkey;

-- Step 3: Recreate FK with ON DELETE SET NULL
ALTER TABLE public.crm_leads
  ADD CONSTRAINT crm_leads_owner_id_fkey
  FOREIGN KEY (owner_id) 
  REFERENCES public.crm_users(id)
  ON DELETE SET NULL;

-- Recreate index for performance (dropped with constraint)
CREATE INDEX IF NOT EXISTS idx_crm_leads_owner_id ON crm_leads(owner_id);

-- ============================================================================
-- FIX 2: crm_contact_logs.user_id - Allow NULL and SET NULL on delete
-- ============================================================================

-- Step 1: Make user_id nullable
ALTER TABLE public.crm_contact_logs
  ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Drop existing FK constraint
ALTER TABLE public.crm_contact_logs
  DROP CONSTRAINT IF EXISTS crm_contact_logs_user_id_fkey;

-- Step 3: Recreate FK with ON DELETE SET NULL
ALTER TABLE public.crm_contact_logs
  ADD CONSTRAINT crm_contact_logs_user_id_fkey
  FOREIGN KEY (user_id) 
  REFERENCES public.crm_users(id)
  ON DELETE SET NULL;

-- Recreate index for performance
CREATE INDEX IF NOT EXISTS idx_crm_contact_logs_user_id ON crm_contact_logs(user_id);

-- ============================================================================
-- UPDATE RLS POLICIES: Handle NULL owner_id for unassigned leads
-- ============================================================================

-- Drop and recreate the leads SELECT policy to include unassigned leads
DROP POLICY IF EXISTS "crm_leads_select_own_or_admin" ON crm_leads;

-- Admins see all leads
-- Marketers see their assigned leads + unassigned leads (shared queue)
CREATE POLICY "crm_leads_select_own_or_admin" ON crm_leads
  FOR SELECT
  TO authenticated
  USING (
    is_crm_admin() OR 
    owner_id = get_crm_user_id() OR 
    owner_id IS NULL  -- Allow marketers to see unassigned leads
  );

-- Update the UPDATE policy to allow claiming unassigned leads
DROP POLICY IF EXISTS "crm_leads_update_own_or_admin" ON crm_leads;

CREATE POLICY "crm_leads_update_own_or_admin" ON crm_leads
  FOR UPDATE
  TO authenticated
  USING (
    is_crm_admin() OR 
    owner_id = get_crm_user_id() OR 
    owner_id IS NULL  -- Allow claiming unassigned leads
  )
  WITH CHECK (
    is_crm_admin() OR 
    owner_id = get_crm_user_id()  -- Can't assign to others unless admin
  );

-- Update contact logs policies to handle NULL user_id
DROP POLICY IF EXISTS "crm_contact_logs_update_own" ON crm_contact_logs;

CREATE POLICY "crm_contact_logs_update_own" ON crm_contact_logs
  FOR UPDATE
  TO authenticated
  USING (
    is_crm_admin() OR 
    user_id = get_crm_user_id() OR
    user_id IS NULL  -- Allow updating logs from deleted users
  )
  WITH CHECK (
    is_crm_admin() OR 
    user_id = get_crm_user_id()
  );

DROP POLICY IF EXISTS "crm_contact_logs_delete_own" ON crm_contact_logs;

CREATE POLICY "crm_contact_logs_delete_own" ON crm_contact_logs
  FOR DELETE
  TO authenticated
  USING (
    is_crm_admin() OR 
    user_id = get_crm_user_id() OR
    user_id IS NULL  -- Allow deleting orphaned logs
  );

-- ============================================================================
-- VERIFICATION: Check updated constraints
-- ============================================================================

DO $$
DECLARE
  leads_owner_constraint TEXT;
  logs_user_constraint TEXT;
  unassigned_count INT;
BEGIN
  -- Verify new FK constraint for crm_leads.owner_id
  SELECT 
    pg_get_constraintdef(oid) INTO leads_owner_constraint
  FROM pg_constraint
  WHERE conname = 'crm_leads_owner_id_fkey';
  
  RAISE NOTICE '✅ New crm_leads.owner_id FK: %', leads_owner_constraint;
  
  -- Verify new FK constraint for crm_contact_logs.user_id
  SELECT 
    pg_get_constraintdef(oid) INTO logs_user_constraint
  FROM pg_constraint
  WHERE conname = 'crm_contact_logs_user_id_fkey';
  
  RAISE NOTICE '✅ New crm_contact_logs.user_id FK: %', logs_user_constraint;
  
  -- Check nullable status
  RAISE NOTICE '✅ crm_leads.owner_id allows NULL: %', (
    SELECT NOT attnotnull FROM pg_attribute 
    WHERE attrelid = 'crm_leads'::regclass AND attname = 'owner_id'
  );
  
  RAISE NOTICE '✅ crm_contact_logs.user_id allows NULL: %', (
    SELECT NOT attnotnull FROM pg_attribute 
    WHERE attrelid = 'crm_contact_logs'::regclass AND attname = 'user_id'
  );
  
  -- Count any existing unassigned leads
  SELECT COUNT(*) INTO unassigned_count FROM crm_leads WHERE owner_id IS NULL;
  RAISE NOTICE 'Current unassigned leads: %', unassigned_count;
  
  RAISE NOTICE '🎉 Migration complete! CRM users can now be deleted without losing leads.';
END $$;

