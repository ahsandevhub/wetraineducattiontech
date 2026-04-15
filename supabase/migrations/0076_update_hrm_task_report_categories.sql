-- Migration: Update HRM task report categories
-- Date: 2026-04-15
-- Purpose: Remove restrictive category constraint so hrm_task_reports can use free-text categories

ALTER TABLE public.hrm_task_reports
  DROP CONSTRAINT IF EXISTS hrm_task_reports_category_check;

-- Categories are now stored as free-form text so users can enter custom values
-- and still choose from suggested categories in the UI.

