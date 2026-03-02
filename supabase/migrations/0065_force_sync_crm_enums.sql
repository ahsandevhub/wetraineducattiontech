-- Migration: Force-sync CRM enums with application constants
-- Date: 2026-03-02
-- Purpose:
--   1) Ensure crm_leads.status supports app statuses
--      NEW, CONTACTED, INTERESTED, SOLD, NOT_INTERESTED, NO_RESPONSE, INVALID_NUMBER
--   2) Ensure lead_source contains REASSIGNED
--   3) Ensure contact_type contains NOTE (used by app UI/types)
--
-- This migration is idempotent and safe to run on both test/live even if partially migrated.

-- -----------------------------------------------------------------------------
-- STEP 1: Ensure target status enum exists
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'crm_lead_status'
  ) THEN
    CREATE TYPE crm_lead_status AS ENUM (
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

-- -----------------------------------------------------------------------------
-- STEP 2: Force-convert crm_leads.status to crm_lead_status with mapping
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.crm_leads
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE IF EXISTS public.crm_leads
  ALTER COLUMN status TYPE crm_lead_status
  USING (
    CASE status::text
      WHEN 'NEW' THEN 'NEW'
      WHEN 'CONTACTED' THEN 'CONTACTED'
      WHEN 'QUALIFIED' THEN 'INTERESTED'
      WHEN 'PROPOSAL' THEN 'INTERESTED'
      WHEN 'NEGOTIATION' THEN 'INTERESTED'
      WHEN 'WON' THEN 'SOLD'
      WHEN 'LOST' THEN 'NOT_INTERESTED'
      WHEN 'INTERESTED' THEN 'INTERESTED'
      WHEN 'SOLD' THEN 'SOLD'
      WHEN 'NOT_INTERESTED' THEN 'NOT_INTERESTED'
      WHEN 'NO_RESPONSE' THEN 'NO_RESPONSE'
      WHEN 'INVALID_NUMBER' THEN 'INVALID_NUMBER'
      ELSE 'NEW'
    END
  )::crm_lead_status;

ALTER TABLE IF EXISTS public.crm_leads
  ALTER COLUMN status SET DEFAULT 'NEW'::crm_lead_status;

-- -----------------------------------------------------------------------------
-- STEP 3: Ensure lead_source contains REASSIGNED
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source') THEN
    BEGIN
      ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'REASSIGNED';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- STEP 4: Ensure contact_type contains NOTE (app uses NOTE in CRM UI)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_type') THEN
    BEGIN
      ALTER TYPE contact_type ADD VALUE IF NOT EXISTS 'NOTE';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- STEP 5: Optional cleanup of legacy enum type if no longer used
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  lead_status_in_use integer;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    SELECT COUNT(*)
      INTO lead_status_in_use
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_type t ON t.oid = a.atttypid
    WHERE c.relkind IN ('r', 'p')
      AND a.attnum > 0
      AND NOT a.attisdropped
      AND t.typname = 'lead_status';

    IF lead_status_in_use = 0 THEN
      DROP TYPE lead_status;
    END IF;
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- STEP 6: Verification snapshot
-- -----------------------------------------------------------------------------
SELECT
  t.typname,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) AS enum_values
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE t.typname IN ('crm_lead_status', 'lead_source', 'contact_type')
GROUP BY t.typname
ORDER BY t.typname;
