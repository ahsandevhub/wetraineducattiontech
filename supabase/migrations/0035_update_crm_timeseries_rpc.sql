-- Migration: Update CRM timeseries RPC for new statuses
-- Purpose: Update the crm_leads_timeseries RPC to use new status values
-- Status mappings: WON→SOLD, LOST→NOT_INTERESTED, QUALIFIED/PROPOSAL→INTERESTED

DROP FUNCTION IF EXISTS crm_leads_timeseries(
  from_ts TIMESTAMP WITH TIME ZONE,
  to_ts TIMESTAMP WITH TIME ZONE,
  scope_owner_id UUID,
  scope_created_by UUID
);

CREATE OR REPLACE FUNCTION crm_leads_timeseries(
  from_ts TIMESTAMP WITH TIME ZONE,
  to_ts TIMESTAMP WITH TIME ZONE,
  scope_owner_id UUID,
  scope_created_by UUID
)
RETURNS TABLE (
  day TEXT,
  total BIGINT,
  sold BIGINT,
  not_interested BIGINT,
  no_response BIGINT,
  invalid_number BIGINT,
  contacted BIGINT,
  pipeline BIGINT
) AS $$
WITH daily_agg AS (
  SELECT
    DATE(crm_leads.created_at)::TEXT as day,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE crm_leads.status = 'SOLD') as sold_count,
    COUNT(*) FILTER (WHERE crm_leads.status = 'NOT_INTERESTED') as not_interested_count,
    COUNT(*) FILTER (WHERE crm_leads.status = 'NO_RESPONSE') as no_response_count,
    COUNT(*) FILTER (WHERE crm_leads.status = 'INVALID_NUMBER') as invalid_number_count,
    COUNT(*) FILTER (WHERE crm_leads.status IN ('CONTACTED', 'INTERESTED', 'SOLD')) as contacted_count
  FROM crm_leads
  WHERE crm_leads.created_at >= from_ts
    AND crm_leads.created_at < to_ts
    AND (scope_owner_id IS NULL OR crm_leads.owner_id = scope_owner_id)
    AND (scope_created_by IS NULL OR crm_leads.created_by = scope_created_by)
  GROUP BY DATE(crm_leads.created_at)
)
SELECT
  da.day,
  da.total_count::BIGINT as total,
  COALESCE(da.sold_count, 0)::BIGINT as sold,
  COALESCE(da.not_interested_count, 0)::BIGINT as not_interested,
  COALESCE(da.no_response_count, 0)::BIGINT as no_response,
  COALESCE(da.invalid_number_count, 0)::BIGINT as invalid_number,
  COALESCE(da.contacted_count, 0)::BIGINT as contacted,
  (COALESCE(da.total_count, 0) - COALESCE(da.sold_count, 0) - COALESCE(da.not_interested_count, 0) - COALESCE(da.no_response_count, 0) - COALESCE(da.invalid_number_count, 0))::BIGINT as pipeline
FROM daily_agg da
ORDER BY da.day;
$$ LANGUAGE SQL STABLE;

-- Verify the function
SELECT * FROM crm_leads_timeseries(
  NOW() - INTERVAL '30 days',
  NOW(),
  NULL,
  NULL
) LIMIT 5;
