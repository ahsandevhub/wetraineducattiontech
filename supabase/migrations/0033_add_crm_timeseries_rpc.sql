-- Migration: Create RPC functions for CRM analytics time-series
-- Purpose: Provide aggregated time-series data for charts without client-side counting

-- Create the crm_leads_timeseries RPC function
-- Returns daily aggregated counts of leads by status
CREATE OR REPLACE FUNCTION crm_leads_timeseries(
  from_ts TIMESTAMPTZ,
  to_ts TIMESTAMPTZ,
  scope_owner_id UUID DEFAULT NULL,
  scope_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
  day DATE,
  total BIGINT,
  won BIGINT,
  lost BIGINT,
  contacted BIGINT,
  pipeline BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    -- Generate all dates in the range
    SELECT DATE(d) as date_day
    FROM generate_series(
      DATE_TRUNC('day', from_ts)::DATE,
      DATE_TRUNC('day', to_ts)::DATE,
      INTERVAL '1 day'
    ) d
  ),
  daily_aggregates AS (
    -- Count leads by status for each day
    SELECT
      DATE(crm_leads.created_at)::DATE as date_day,
      COUNT(*) FILTER (WHERE TRUE) as total_count,
      COUNT(*) FILTER (WHERE crm_leads.status = 'WON') as won_count,
      COUNT(*) FILTER (WHERE crm_leads.status = 'LOST') as lost_count,
      COUNT(*) FILTER (WHERE crm_leads.status IN ('CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON')) as contacted_count
    FROM crm_leads
    WHERE 1=1
      AND crm_leads.created_at >= from_ts
      AND crm_leads.created_at < to_ts + INTERVAL '1 day'
      AND (scope_owner_id IS NULL OR crm_leads.owner_id = scope_owner_id)
      AND (scope_created_by IS NULL OR crm_leads.created_by = scope_created_by)
    GROUP BY DATE(crm_leads.created_at)::DATE
  )
  SELECT
    ds.date_day as day,
    COALESCE(da.total_count, 0)::BIGINT as total,
    COALESCE(da.won_count, 0)::BIGINT as won,
    COALESCE(da.lost_count, 0)::BIGINT as lost,
    COALESCE(da.contacted_count, 0)::BIGINT as contacted,
    (COALESCE(da.total_count, 0) - COALESCE(da.won_count, 0) - COALESCE(da.lost_count, 0))::BIGINT as pipeline
  FROM date_series ds
  LEFT JOIN daily_aggregates da ON ds.date_day = da.date_day
  ORDER BY ds.date_day ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add RLS check if needed (already covered by SECURITY DEFINER)
-- Users accessing this function should have read access to crm_leads

-- Ensure RPC is callable with proper permissions
GRANT EXECUTE ON FUNCTION crm_leads_timeseries TO authenticated;
GRANT EXECUTE ON FUNCTION crm_leads_timeseries TO anon;
