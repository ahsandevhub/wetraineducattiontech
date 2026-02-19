-- Migration: Update CRM leads status enum and backfill data
-- Date: 2024
-- Purpose: Replace old lead statuses with new business logic statuses
-- Status migration: NEW→NEW, CONTACTED→CONTACTED, QUALIFIED/PROPOSAL/NEGOTIATION→INTERESTED, WON→SOLD, LOST→NOT_INTERESTED

-- Step 1: Create new status enum type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'crm_lead_status_new'
  ) THEN
    CREATE TYPE crm_lead_status_new AS ENUM (
      'NEW',
      'CONTACTED',
      'INTERESTED',
      'SOLD',
      'NOT_INTERESTED',
      'NO_RESPONSE',
      'INVALID_NUMBER'
    );
  END IF;
END
$$;

-- Step 2: Add temporary column with new enum type
ALTER TABLE IF EXISTS crm_leads
ADD COLUMN IF NOT EXISTS status_new crm_lead_status_new;

-- Step 3: Backfill data using migration mapping
-- This ensures all existing leads are properly mapped to new statuses
UPDATE crm_leads
SET status_new = CASE status
  -- Direct mappings
  WHEN 'NEW' THEN 'NEW'::crm_lead_status_new
  WHEN 'CONTACTED' THEN 'CONTACTED'::crm_lead_status_new
  
  -- Consolidate qualified/proposal/negotiation to INTERESTED
  WHEN 'QUALIFIED' THEN 'INTERESTED'::crm_lead_status_new
  WHEN 'PROPOSAL' THEN 'INTERESTED'::crm_lead_status_new
  WHEN 'NEGOTIATION' THEN 'INTERESTED'::crm_lead_status_new
  
  -- Map success status
  WHEN 'WON' THEN 'SOLD'::crm_lead_status_new
  
  -- Map failure/lost to NOT_INTERESTED
  WHEN 'LOST' THEN 'NOT_INTERESTED'::crm_lead_status_new
  
  -- Default any unknowns to NEW
  ELSE 'NEW'::crm_lead_status_new
END
WHERE status IS NOT NULL;

-- Step 4: Handle any NULL values (default to NEW)
UPDATE crm_leads
SET status_new = 'NEW'::crm_lead_status_new
WHERE status_new IS NULL;

-- Step 5: Drop old status column and rename new one
ALTER TABLE crm_leads
DROP COLUMN IF EXISTS status;

ALTER TABLE crm_leads
RENAME COLUMN status_new TO status;

-- Step 6: Set default value for new leads
ALTER TABLE crm_leads
ALTER COLUMN status SET DEFAULT 'NEW'::crm_lead_status_new;

-- Step 7: Drop old enum if it exists
DROP TYPE IF EXISTS crm_lead_status CASCADE;

-- Step 8: Rename new enum to standard name
ALTER TYPE crm_lead_status_new RENAME TO crm_lead_status;

-- Step 9: Update RLS policies if needed
-- The existing policies checking status values should still work as enum values are text-comparable

-- Step 10: Verify migration success
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'NEW' THEN 1 END) as new_count,
  COUNT(CASE WHEN status = 'CONTACTED' THEN 1 END) as contacted_count,
  COUNT(CASE WHEN status = 'INTERESTED' THEN 1 END) as interested_count,
  COUNT(CASE WHEN status = 'SOLD' THEN 1 END) as sold_count,
  COUNT(CASE WHEN status = 'NOT_INTERESTED' THEN 1 END) as not_interested_count,
  COUNT(CASE WHEN status = 'NO_RESPONSE' THEN 1 END) as no_response_count,
  COUNT(CASE WHEN status = 'INVALID_NUMBER' THEN 1 END) as invalid_number_count
FROM crm_leads;
