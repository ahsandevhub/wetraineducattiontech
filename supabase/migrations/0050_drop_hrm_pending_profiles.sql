-- Migration: Remove HRM pending profiles
-- Date: 2026-02-25
-- Purpose: Replace pre-invite workflow with unified search-then-add workflow

-- Drop the pending profiles table
DROP TABLE IF EXISTS public.hrm_pending_profiles CASCADE;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ HRM pending profiles removed';
  RAISE NOTICE 'ℹ️  HRM now uses unified search workflow (same as CRM)';
  RAISE NOTICE 'ℹ️  Users must exist in auth.users before adding to HRM';
END $$;
