-- Migration: Fix crm_leads_timeseries RPC
-- Date: 2026-02-26
-- Problem: crm_leads.created_by column does not exist; RPC was referencing a
--          non-existent column causing all timeseries queries to return an
--          empty error object {}.
-- Fix: scope_created_by now filters by owner_id (crm_leads has no separate
--      created_by — the owner IS the assignee/creator).

DROP FUNCTION IF EXISTS crm_leads_timeseries(
  TIMESTAMP WITH TIME ZONE,
  TIMESTAMP WITH TIME ZONE,
  UUID,
  UUID
);

CREATE OR REPLACE FUNCTION crm_leads_timeseries(
  from_ts         TIMESTAMP WITH TIME ZONE,
  to_ts           TIMESTAMP WITH TIME ZONE,
  scope_owner_id  UUID DEFAULT NULL,
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
      COUNT(*)                                                        AS total_count,
      COUNT(*) FILTER (WHERE cl.status = 'SOLD')                     AS sold_count,
      COUNT(*) FILTER (WHERE cl.status = 'NOT_INTERESTED')           AS not_interested_count,
      COUNT(*) FILTER (WHERE cl.status = 'NO_RESPONSE')              AS no_response_count,
      COUNT(*) FILTER (WHERE cl.status = 'INVALID_NUMBER')           AS invalid_number_count,
      COUNT(*) FILTER (WHERE cl.status IN ('CONTACTED', 'INTERESTED', 'SOLD')) AS contacted_count
    FROM public.crm_leads cl
    WHERE cl.created_at >= from_ts
      AND cl.created_at <  to_ts
      -- scope_owner_id: filter by assigned owner
      AND (scope_owner_id   IS NULL OR cl.owner_id = scope_owner_id)
      -- scope_created_by: crm_leads has no separate created_by column;
      --                   treat as an alias for owner_id
      AND (scope_created_by IS NULL OR cl.owner_id = scope_created_by)
    GROUP BY DATE(cl.created_at)
  )
  SELECT
    da.day,
    da.total_count::BIGINT                                               AS total,
    COALESCE(da.sold_count,           0)::BIGINT                        AS sold,
    COALESCE(da.not_interested_count, 0)::BIGINT                        AS not_interested,
    COALESCE(da.no_response_count,    0)::BIGINT                        AS no_response,
    COALESCE(da.invalid_number_count, 0)::BIGINT                        AS invalid_number,
    COALESCE(da.contacted_count,      0)::BIGINT                        AS contacted,
    (
      COALESCE(da.total_count,          0)
      - COALESCE(da.sold_count,           0)
      - COALESCE(da.not_interested_count, 0)
      - COALESCE(da.no_response_count,    0)
      - COALESCE(da.invalid_number_count, 0)
    )::BIGINT                                                            AS pipeline
  FROM daily_agg da
  ORDER BY da.day;
$$;

GRANT EXECUTE ON FUNCTION crm_leads_timeseries TO authenticated;
GRANT EXECUTE ON FUNCTION crm_leads_timeseries TO anon;

DO $$
BEGIN
  RAISE NOTICE '✅ crm_leads_timeseries fixed — scope_created_by now maps to owner_id';
END $$;
