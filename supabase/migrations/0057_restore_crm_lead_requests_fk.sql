-- Migration: Restore FK constraints on crm_lead_requests
-- Date: 2026-02-26
-- Problem: CASCADE DROP of crm_users in migration 0048 also dropped the FK
--          constraints from crm_lead_requests.requester_id and reviewed_by.
--          PostgREST uses FK constraints to resolve relationship joins, so
--          without them the schema cache reports PGRST200 errors.
-- Fix: Re-add FK constraints for requester_id and reviewed_by.

-- Clean any orphaned rows whose requester_id no longer has a crm_user
UPDATE public.crm_lead_requests
SET status = 'DECLINED', admin_note = 'Auto-declined: requester no longer exists'
WHERE requester_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.crm_users WHERE id = crm_lead_requests.requester_id);

DELETE FROM public.crm_lead_requests
WHERE requester_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.crm_users WHERE id = crm_lead_requests.requester_id);

-- Nullify reviewed_by where the reviewer no longer exists
UPDATE public.crm_lead_requests
SET reviewed_by = NULL
WHERE reviewed_by IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.crm_users WHERE id = crm_lead_requests.reviewed_by);

-- Add FK: requester_id → crm_users(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'crm_lead_requests'
      AND constraint_name = 'crm_lead_requests_requester_id_fkey'
  ) THEN
    ALTER TABLE public.crm_lead_requests
      ADD CONSTRAINT crm_lead_requests_requester_id_fkey
      FOREIGN KEY (requester_id) REFERENCES public.crm_users(id) ON DELETE RESTRICT;
    RAISE NOTICE '✅ Added FK: crm_lead_requests.requester_id → crm_users(id)';
  ELSE
    RAISE NOTICE '⏭  FK crm_lead_requests_requester_id_fkey already exists';
  END IF;
END $$;

-- Add FK: reviewed_by → crm_users(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'crm_lead_requests'
      AND constraint_name = 'crm_lead_requests_reviewed_by_fkey'
  ) THEN
    ALTER TABLE public.crm_lead_requests
      ADD CONSTRAINT crm_lead_requests_reviewed_by_fkey
      FOREIGN KEY (reviewed_by) REFERENCES public.crm_users(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Added FK: crm_lead_requests.reviewed_by → crm_users(id)';
  ELSE
    RAISE NOTICE '⏭  FK crm_lead_requests_reviewed_by_fkey already exists';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '✅ Restored FK constraints on crm_lead_requests';
END $$;
