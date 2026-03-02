-- Migration: Fix live CRM helper functions + timeseries RPC + schema cache
-- Date: 2026-03-02
-- Purpose:
--   Resolve live-only runtime errors:
--   1) column "auth_user_id" does not exist
--   2) crm_leads_timeseries(...) not found in PostgREST schema cache
--
-- This migration is idempotent and safe for both test/live.

-- -----------------------------------------------------------------------------
-- STEP 1: Recreate helper functions against new crm_users schema
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_crm_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.crm_users
    WHERE id = auth.uid()
      AND crm_role = 'ADMIN'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_crm_user_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT id
    FROM public.crm_users
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- STEP 2: Recreate crm_leads_timeseries RPC with stable signature used by app
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.crm_leads_timeseries(
  TIMESTAMP WITH TIME ZONE,
  TIMESTAMP WITH TIME ZONE,
  UUID,
  UUID
);

CREATE OR REPLACE FUNCTION public.crm_leads_timeseries(
  from_ts          TIMESTAMP WITH TIME ZONE,
  to_ts            TIMESTAMP WITH TIME ZONE,
  scope_owner_id   UUID DEFAULT NULL,
  scope_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
  day            TEXT,
  total          BIGINT,
  sold           BIGINT,
  not_interested BIGINT,
  no_response    BIGINT,
  invalid_number BIGINT,
  contacted      BIGINT,
  pipeline       BIGINT
)
LANGUAGE SQL
STABLE
AS $$
  WITH daily_agg AS (
    SELECT
      DATE(cl.created_at)::TEXT AS day,
      COUNT(*) AS total_count,
      COUNT(*) FILTER (WHERE cl.status = 'SOLD') AS sold_count,
      COUNT(*) FILTER (WHERE cl.status = 'NOT_INTERESTED') AS not_interested_count,
      COUNT(*) FILTER (WHERE cl.status = 'NO_RESPONSE') AS no_response_count,
      COUNT(*) FILTER (WHERE cl.status = 'INVALID_NUMBER') AS invalid_number_count,
      COUNT(*) FILTER (WHERE cl.status IN ('CONTACTED', 'INTERESTED', 'SOLD')) AS contacted_count
    FROM public.crm_leads cl
    WHERE cl.created_at >= from_ts
      AND cl.created_at < to_ts
      AND (scope_owner_id IS NULL OR cl.owner_id = scope_owner_id)
      -- created_by alias in current model
      AND (scope_created_by IS NULL OR cl.owner_id = scope_created_by)
    GROUP BY DATE(cl.created_at)
  )
  SELECT
    da.day,
    da.total_count::BIGINT AS total,
    COALESCE(da.sold_count, 0)::BIGINT AS sold,
    COALESCE(da.not_interested_count, 0)::BIGINT AS not_interested,
    COALESCE(da.no_response_count, 0)::BIGINT AS no_response,
    COALESCE(da.invalid_number_count, 0)::BIGINT AS invalid_number,
    COALESCE(da.contacted_count, 0)::BIGINT AS contacted,
    (
      COALESCE(da.total_count, 0)
      - COALESCE(da.sold_count, 0)
      - COALESCE(da.not_interested_count, 0)
      - COALESCE(da.no_response_count, 0)
      - COALESCE(da.invalid_number_count, 0)
    )::BIGINT AS pipeline
  FROM daily_agg da
  ORDER BY da.day;
$$;

GRANT EXECUTE ON FUNCTION public.crm_leads_timeseries TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_leads_timeseries TO anon;
GRANT EXECUTE ON FUNCTION public.crm_leads_timeseries TO service_role;

-- -----------------------------------------------------------------------------
-- STEP 3: Force PostgREST schema cache reload (important for RPC discovery)
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

DO $$
BEGIN
  RAISE NOTICE '✅ CRM helper functions refreshed (no auth_user_id reference)';
  RAISE NOTICE '✅ crm_leads_timeseries RPC recreated with app signature';
  RAISE NOTICE '✅ Triggered PostgREST schema cache reload';
END $$;
