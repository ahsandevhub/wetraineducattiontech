-- Migration: Sync crm_lead_requests table across environments
-- Date: 2026-03-02
-- Purpose:
--   Ensure crm_lead_requests exists with current app schema and policies
--   in both test/live, and refresh PostgREST schema cache.
--
-- Idempotent: safe to run repeatedly.

-- -----------------------------------------------------------------------------
-- STEP 1: Ensure table exists with required columns
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_lead_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.crm_users(id) ON DELETE RESTRICT,
  lead_id uuid NULL REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  lead_payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DECLINED')),
  admin_note text,
  reviewed_by uuid REFERENCES public.crm_users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- STEP 2: Ensure missing columns exist on legacy variants
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.crm_lead_requests
  ADD COLUMN IF NOT EXISTS lead_id uuid NULL REFERENCES public.crm_leads(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.crm_lead_requests
  ADD COLUMN IF NOT EXISTS admin_note text;

ALTER TABLE IF EXISTS public.crm_lead_requests
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.crm_users(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.crm_lead_requests
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE IF EXISTS public.crm_lead_requests
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Ensure status default/check and lead_payload type baseline
ALTER TABLE IF EXISTS public.crm_lead_requests
  ALTER COLUMN status SET DEFAULT 'PENDING';

-- -----------------------------------------------------------------------------
-- STEP 3: Ensure indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_crm_lead_requests_status_created_at
  ON public.crm_lead_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_lead_requests_requester_id
  ON public.crm_lead_requests(requester_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_lead_requests_reviewed_at
  ON public.crm_lead_requests(reviewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_lead_requests_lead_id
  ON public.crm_lead_requests(lead_id);

-- -----------------------------------------------------------------------------
-- STEP 4: Enable RLS and recreate canonical policies (new schema: id = auth.uid())
-- -----------------------------------------------------------------------------
ALTER TABLE public.crm_lead_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS crm_lead_requests_marketer_insert ON public.crm_lead_requests;
DROP POLICY IF EXISTS crm_lead_requests_marketer_select ON public.crm_lead_requests;
DROP POLICY IF EXISTS crm_lead_requests_admin_select ON public.crm_lead_requests;
DROP POLICY IF EXISTS crm_lead_requests_admin_update ON public.crm_lead_requests;
DROP POLICY IF EXISTS crm_lead_requests_admin_delete ON public.crm_lead_requests;

CREATE POLICY crm_lead_requests_marketer_insert
  ON public.crm_lead_requests
  FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY crm_lead_requests_marketer_select
  ON public.crm_lead_requests
  FOR SELECT
  USING (requester_id = auth.uid());

CREATE POLICY crm_lead_requests_admin_select
  ON public.crm_lead_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_users
      WHERE public.crm_users.id = auth.uid()
        AND public.crm_users.crm_role = 'ADMIN'
    )
  );

CREATE POLICY crm_lead_requests_admin_update
  ON public.crm_lead_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_users
      WHERE public.crm_users.id = auth.uid()
        AND public.crm_users.crm_role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.crm_users
      WHERE public.crm_users.id = auth.uid()
        AND public.crm_users.crm_role = 'ADMIN'
    )
  );

CREATE POLICY crm_lead_requests_admin_delete
  ON public.crm_lead_requests
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_users
      WHERE public.crm_users.id = auth.uid()
        AND public.crm_users.crm_role = 'ADMIN'
    )
  );

-- -----------------------------------------------------------------------------
-- STEP 5: Grants + schema cache reload
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_lead_requests TO authenticated;
GRANT ALL ON public.crm_lead_requests TO service_role;

NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ crm_lead_requests table synced';
  RAISE NOTICE '✅ canonical RLS policies applied';
  RAISE NOTICE '✅ PostgREST schema cache reload triggered';
END $$;
