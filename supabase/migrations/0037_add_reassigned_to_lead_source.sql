-- Migration: Add REASSIGNED to lead_source enum
-- Purpose: Support the new reassignment feature where leads can be reassigned between marketers
-- The source is set to 'REASSIGNED' when a lead is reassigned to a new owner

-- Step 1: Create new enum type with REASSIGNED option
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'lead_source_new'
  ) THEN
    CREATE TYPE lead_source_new AS ENUM (
      'ADMIN',
      'WEBSITE',
      'REFERRAL',
      'SOCIAL_MEDIA',
      'REASSIGNED',
      'OTHER'
    );
  END IF;
END
$$;

-- Step 2: Add temporary column with new enum type
ALTER TABLE IF EXISTS crm_leads
ADD COLUMN IF NOT EXISTS source_new lead_source_new;

-- Step 3: Backfill existing data (direct mapping - all existing values remain the same)
UPDATE crm_leads
SET source_new = (
  CASE source
    WHEN 'ADMIN' THEN 'ADMIN'::lead_source_new
    WHEN 'WEBSITE' THEN 'WEBSITE'::lead_source_new
    WHEN 'REFERRAL' THEN 'REFERRAL'::lead_source_new
    WHEN 'SOCIAL_MEDIA' THEN 'SOCIAL_MEDIA'::lead_source_new
    WHEN 'OTHER' THEN 'OTHER'::lead_source_new
    ELSE 'OTHER'::lead_source_new
  END
);

-- Step 4: Drop the old source column and rename new one
ALTER TABLE IF EXISTS crm_leads
DROP COLUMN IF EXISTS source;

ALTER TABLE IF EXISTS crm_leads
RENAME COLUMN source_new TO source;

-- Step 5: Set default for new column
ALTER TABLE IF EXISTS crm_leads
ALTER COLUMN source SET DEFAULT 'OTHER'::lead_source_new;

-- Step 6: Drop old enum type
DROP TYPE IF EXISTS lead_source;

-- Step 7: Rename new enum to original name
ALTER TYPE lead_source_new RENAME TO lead_source;

-- ============================================================================
-- Verification: Check that enum was created successfully
-- ============================================================================
SELECT 
  t.typname,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'lead_source'
GROUP BY t.typname;

-- Expected result:
-- typname    | enum_values
-- -----------+----------------------------------------------
-- lead_source | {ADMIN,WEBSITE,REFERRAL,SOCIAL_MEDIA,REASSIGNED,OTHER}
