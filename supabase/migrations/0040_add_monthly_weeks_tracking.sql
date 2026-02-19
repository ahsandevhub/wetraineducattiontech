-- Migration: Add weeks tracking columns to hrm_monthly_results
-- Date: 2026-02-18
-- Description: Adds weeks_count_used, expected_weeks_count, is_complete_month to monthly results

ALTER TABLE public.hrm_monthly_results
  ADD COLUMN IF NOT EXISTS weeks_count_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expected_weeks_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_complete_month BOOLEAN NOT NULL DEFAULT false;

-- Add indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_hrm_monthly_results_is_complete_month 
  ON public.hrm_monthly_results(is_complete_month);

-- Comment for documentation
COMMENT ON COLUMN public.hrm_monthly_results.weeks_count_used IS 'Number of weeks actually used in monthly score calculation';
COMMENT ON COLUMN public.hrm_monthly_results.expected_weeks_count IS 'Expected number of Fridays in the month';
COMMENT ON COLUMN public.hrm_monthly_results.is_complete_month IS 'True if weeks_count_used equals expected_weeks_count';
