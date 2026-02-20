-- Data Migration: Import Lead-Pilot CRM data into WeTrain Education Supabase
-- Date: 2026-02-16
-- Purpose: Migrate users, leads, and contact logs from old lead-pilot Supabase
-- 
-- PREREQUISITES:
-- 1. Run 20260216_consolidate_crm_schema.sql first
-- 2. Export data from old lead-pilot Supabase using export script
-- 3. Review user mapping strategy (merge vs create new)
--
-- USAGE:
-- This script provides the framework. You'll need to populate it with actual data.
-- See accompanying TypeScript migration script for automated approach.

-- ============================================================================
-- STEP 1: CREATE TEMPORARY MIGRATION TABLES
-- ============================================================================

-- Store UUID mapping for users (old lead-pilot UUID → new unified auth UUID)
CREATE TEMP TABLE IF NOT EXISTS migration_user_map (
  old_user_id UUID PRIMARY KEY,
  new_crm_user_id UUID NOT NULL,
  new_auth_user_id UUID NOT NULL,
  email TEXT NOT NULL,
  migration_type TEXT NOT NULL, -- 'merged' or 'created'
  migrated_at TIMESTAMPTZ DEFAULT now()
);

-- Store UUID mapping for leads
CREATE TEMP TABLE IF NOT EXISTS migration_lead_map (
  old_lead_id UUID PRIMARY KEY,
  new_lead_id UUID NOT NULL,
  migrated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- STEP 2: MIGRATE AUTH USERS (MANUAL STEP - USE SUPABASE ADMIN API)
-- ============================================================================

-- This must be done via Supabase Admin API because auth.users is managed by Supabase Auth
-- See migration script: scripts/migrate-leadpilot-users.ts
--
-- For each user in old lead-pilot:
--   1. Check if email exists in new auth.users
--   2. If exists: use existing auth_user_id (MERGE)
--   3. If not exists: createUser via Admin API (CREATE NEW)
--   4. Record mapping in migration_user_map
--
-- After users are created, the handle_new_user() trigger will auto-create:
--   - profiles (education system)
--   - crm_users (CRM system) - only if admin email pattern matches

-- ============================================================================
-- STEP 3: FIX CRM_USERS FOR NON-ADMIN MARKETERS
-- ============================================================================

-- For marketers who were created but aren't admins, manually insert crm_users
-- (since trigger only creates crm_users for admin emails)
-- 
-- Example: If you have specific marketer emails from lead-pilot:
/*
INSERT INTO crm_users (auth_user_id, email, full_name, crm_role, is_active, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name',
  'MARKETER'::crm_role,
  true,
  now(),
  now()
FROM auth.users au
WHERE au.email IN (
  'marketer1@example.com',
  'marketer2@example.com'
  -- Add all marketer emails from old lead-pilot
)
ON CONFLICT (email) DO NOTHING;
*/

-- ============================================================================
-- STEP 4: POPULATE USER MAPPING TABLE
-- ============================================================================

-- After auth users and crm_users are created, populate mapping
-- This allows us to remap owner_ids in leads
/*
INSERT INTO migration_user_map (old_user_id, new_crm_user_id, new_auth_user_id, email, migration_type)
VALUES
  -- Example entries (replace with actual data from export)
  ('old-uuid-1', 'new-crm-uuid-1', 'new-auth-uuid-1', 'admin@example.com', 'merged'),
  ('old-uuid-2', 'new-crm-uuid-2', 'new-auth-uuid-2', 'marketer@example.com', 'created');
  -- Add all user mappings here
*/

-- ============================================================================
-- STEP 5: MIGRATE LEADS
-- ============================================================================

-- Insert leads with remapped owner_ids
-- IMPORTANT: Must disable triggers temporarily to preserve created_at timestamps
ALTER TABLE crm_leads DISABLE TRIGGER update_crm_leads_updated_at;

/*
-- Example lead migration (replace with actual data)
INSERT INTO crm_leads (
  id, 
  name, 
  email, 
  phone, 
  company, 
  status, 
  source, 
  owner_id, 
  notes, 
  last_contacted_at, 
  created_at, 
  updated_at
)
SELECT
  old_lead_id,  -- Keep same UUID or gen_random_uuid() for new
  name,
  email,
  phone,
  company,
  status::lead_status,  -- Cast to new enum type
  source::lead_source,  -- Cast to new enum type
  (SELECT new_crm_user_id FROM migration_user_map WHERE old_user_id = old_owner_id),  -- Remap
  notes,
  last_contacted_at,
  created_at,
  updated_at
FROM old_leadpilot_leads_export;  -- Temporary table with exported data
*/

-- Re-enable triggers
ALTER TABLE crm_leads ENABLE TRIGGER update_crm_leads_updated_at;

-- ============================================================================
-- STEP 6: MIGRATE CONTACT LOGS
-- ============================================================================

-- Insert contact logs with remapped lead_id and user_id
ALTER TABLE crm_contact_logs DISABLE TRIGGER update_crm_contact_logs_updated_at;

/*
-- Example contact log migration
INSERT INTO crm_contact_logs (
  id,
  lead_id,
  user_id,
  contact_type,
  notes,
  created_at,
  updated_at
)
SELECT
  old_log_id,
  (SELECT new_lead_id FROM migration_lead_map WHERE old_lead_id = old_lead_id),  -- Remap lead
  (SELECT new_crm_user_id FROM migration_user_map WHERE old_user_id = old_user_id),  -- Remap user
  contact_type::contact_type,  -- Cast to new enum
  notes,
  created_at,
  updated_at
FROM old_leadpilot_contact_logs_export;
*/

-- Re-enable triggers
ALTER TABLE crm_contact_logs ENABLE TRIGGER update_crm_contact_logs_updated_at;

-- ============================================================================
-- STEP 7: VALIDATION & VERIFICATION
-- ============================================================================

-- Count verification
DO $$
DECLARE
  user_count INTEGER;
  lead_count INTEGER;
  log_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM crm_users;
  SELECT COUNT(*) INTO lead_count FROM crm_leads;
  SELECT COUNT(*) INTO log_count FROM crm_contact_logs;
  
  RAISE NOTICE 'Migration Results:';
  RAISE NOTICE '  CRM Users: %', user_count;
  RAISE NOTICE '  Leads: %', lead_count;
  RAISE NOTICE '  Contact Logs: %', log_count;
  
  -- Check for orphaned records
  IF EXISTS (SELECT 1 FROM crm_leads WHERE owner_id NOT IN (SELECT id FROM crm_users)) THEN
    RAISE WARNING 'Found leads with invalid owner_id!';
  END IF;
  
  IF EXISTS (SELECT 1 FROM crm_contact_logs WHERE lead_id NOT IN (SELECT id FROM crm_leads)) THEN
    RAISE WARNING 'Found contact logs with invalid lead_id!';
  END IF;
END $$;

-- Sample data check
SELECT 
  'crm_users' as table_name,
  COUNT(*) as total_rows,
  COUNT(DISTINCT crm_role) as unique_roles,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM crm_users
UNION ALL
SELECT 
  'crm_leads',
  COUNT(*),
  COUNT(DISTINCT status),
  MIN(created_at),
  MAX(created_at)
FROM crm_leads
UNION ALL
SELECT 
  'crm_contact_logs',
  COUNT(*),
  COUNT(DISTINCT contact_type),
  MIN(created_at),
  MAX(created_at)
FROM crm_contact_logs;

-- ============================================================================
-- STEP 8: CLEANUP (AFTER VERIFICATION ONLY!)
-- ============================================================================

-- Keep migration_user_map for 30 days for reference
-- DROP TABLE IF EXISTS migration_user_map;
-- DROP TABLE IF EXISTS migration_lead_map;

-- ============================================================================
-- ROLLBACK STRATEGY (IF NEEDED)
-- ============================================================================

-- In case of critical errors, rollback:
/*
BEGIN;
  DELETE FROM crm_contact_logs WHERE created_at > '2026-02-16';
  DELETE FROM crm_leads WHERE created_at > '2026-02-16';
  DELETE FROM crm_users WHERE auth_user_id IN (
    SELECT id FROM auth.users WHERE created_at > '2026-02-16'
  );
  -- Note: Cannot easily rollback auth.users - use Supabase Admin API
ROLLBACK;
*/

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Data migration framework ready.';
  RAISE NOTICE 'Complete user mapping and run actual data inserts.';
  RAISE NOTICE 'See: scripts/migrate-leadpilot-users.ts for automation.';
  RAISE NOTICE '============================================';
END $$;
