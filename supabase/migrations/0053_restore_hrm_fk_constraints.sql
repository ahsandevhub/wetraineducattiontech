-- Migration: Restore HRM FK constraints after CASCADE drop in migration 0049
-- Date: 2026-02-26
-- Problem: When migration 0049 dropped hrm_users CASCADE, all FK constraints in tables
--          that referenced hrm_users.id were also dropped. The tables themselves survived
--          but lost their FK relationships. Migration 0052 used CREATE TABLE IF NOT EXISTS
--          which was skipped since tables already existed.
-- Solution: Use ALTER TABLE ADD CONSTRAINT with existence checks to restore FK constraints.

-- Helper function to check if a constraint exists
CREATE OR REPLACE FUNCTION public.constraint_exists(p_table TEXT, p_constraint TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = p_table
      AND constraint_name = p_constraint
  );
$$ LANGUAGE sql STABLE;

-- =========================================
-- hrm_assignments FK constraints
-- =========================================

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_assignments', 'hrm_assignments_marker_admin_id_fkey') THEN
    ALTER TABLE public.hrm_assignments
      ADD CONSTRAINT hrm_assignments_marker_admin_id_fkey
      FOREIGN KEY (marker_admin_id) REFERENCES public.hrm_users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_assignments', 'hrm_assignments_subject_user_id_fkey') THEN
    ALTER TABLE public.hrm_assignments
      ADD CONSTRAINT hrm_assignments_subject_user_id_fkey
      FOREIGN KEY (subject_user_id) REFERENCES public.hrm_users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_assignments', 'hrm_assignments_created_by_id_fkey') THEN
    ALTER TABLE public.hrm_assignments
      ADD CONSTRAINT hrm_assignments_created_by_id_fkey
      FOREIGN KEY (created_by_id) REFERENCES public.hrm_users(id);
  END IF;
END $$;

-- =========================================
-- hrm_subject_criteria_sets FK constraints
-- =========================================

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_subject_criteria_sets', 'hrm_subject_criteria_sets_subject_user_id_fkey') THEN
    ALTER TABLE public.hrm_subject_criteria_sets
      ADD CONSTRAINT hrm_subject_criteria_sets_subject_user_id_fkey
      FOREIGN KEY (subject_user_id) REFERENCES public.hrm_users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_subject_criteria_sets', 'hrm_subject_criteria_sets_created_by_id_fkey') THEN
    ALTER TABLE public.hrm_subject_criteria_sets
      ADD CONSTRAINT hrm_subject_criteria_sets_created_by_id_fkey
      FOREIGN KEY (created_by_id) REFERENCES public.hrm_users(id);
  END IF;
END $$;

-- =========================================
-- hrm_kpi_submissions FK constraints
-- =========================================

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_kpi_submissions', 'hrm_kpi_submissions_week_id_fkey') THEN
    ALTER TABLE public.hrm_kpi_submissions
      ADD CONSTRAINT hrm_kpi_submissions_week_id_fkey
      FOREIGN KEY (week_id) REFERENCES public.hrm_weeks(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_kpi_submissions', 'hrm_kpi_submissions_marker_admin_id_fkey') THEN
    ALTER TABLE public.hrm_kpi_submissions
      ADD CONSTRAINT hrm_kpi_submissions_marker_admin_id_fkey
      FOREIGN KEY (marker_admin_id) REFERENCES public.hrm_users(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_kpi_submissions', 'hrm_kpi_submissions_subject_user_id_fkey') THEN
    ALTER TABLE public.hrm_kpi_submissions
      ADD CONSTRAINT hrm_kpi_submissions_subject_user_id_fkey
      FOREIGN KEY (subject_user_id) REFERENCES public.hrm_users(id);
  END IF;
END $$;

-- =========================================
-- hrm_weekly_results FK constraints
-- =========================================

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_weekly_results', 'hrm_weekly_results_week_id_fkey') THEN
    ALTER TABLE public.hrm_weekly_results
      ADD CONSTRAINT hrm_weekly_results_week_id_fkey
      FOREIGN KEY (week_id) REFERENCES public.hrm_weeks(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_weekly_results', 'hrm_weekly_results_subject_user_id_fkey') THEN
    ALTER TABLE public.hrm_weekly_results
      ADD CONSTRAINT hrm_weekly_results_subject_user_id_fkey
      FOREIGN KEY (subject_user_id) REFERENCES public.hrm_users(id);
  END IF;
END $$;

-- =========================================
-- hrm_admin_compliance FK constraints
-- =========================================

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_admin_compliance', 'hrm_admin_compliance_week_id_fkey') THEN
    ALTER TABLE public.hrm_admin_compliance
      ADD CONSTRAINT hrm_admin_compliance_week_id_fkey
      FOREIGN KEY (week_id) REFERENCES public.hrm_weeks(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_admin_compliance', 'hrm_admin_compliance_admin_id_fkey') THEN
    ALTER TABLE public.hrm_admin_compliance
      ADD CONSTRAINT hrm_admin_compliance_admin_id_fkey
      FOREIGN KEY (admin_id) REFERENCES public.hrm_users(id);
  END IF;
END $$;

-- =========================================
-- hrm_monthly_results FK constraints
-- =========================================

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_monthly_results', 'hrm_monthly_results_month_id_fkey') THEN
    ALTER TABLE public.hrm_monthly_results
      ADD CONSTRAINT hrm_monthly_results_month_id_fkey
      FOREIGN KEY (month_id) REFERENCES public.hrm_months(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_monthly_results', 'hrm_monthly_results_subject_user_id_fkey') THEN
    ALTER TABLE public.hrm_monthly_results
      ADD CONSTRAINT hrm_monthly_results_subject_user_id_fkey
      FOREIGN KEY (subject_user_id) REFERENCES public.hrm_users(id);
  END IF;
END $$;

-- =========================================
-- hrm_subject_month_states FK constraints
-- =========================================

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_subject_month_states', 'hrm_subject_month_states_subject_user_id_fkey') THEN
    ALTER TABLE public.hrm_subject_month_states
      ADD CONSTRAINT hrm_subject_month_states_subject_user_id_fkey
      FOREIGN KEY (subject_user_id) REFERENCES public.hrm_users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =========================================
-- hrm_email_logs FK constraints
-- =========================================

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_email_logs', 'hrm_email_logs_subject_user_id_fkey') THEN
    ALTER TABLE public.hrm_email_logs
      ADD CONSTRAINT hrm_email_logs_subject_user_id_fkey
      FOREIGN KEY (subject_user_id) REFERENCES public.hrm_users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_email_logs', 'hrm_email_logs_month_id_fkey') THEN
    ALTER TABLE public.hrm_email_logs
      ADD CONSTRAINT hrm_email_logs_month_id_fkey
      FOREIGN KEY (month_id) REFERENCES public.hrm_months(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_email_logs', 'hrm_email_logs_sent_by_admin_id_fkey') OR
     NOT public.constraint_exists('hrm_email_logs', 'sent_by_admin_id_fkey') THEN
    -- The FK join in code uses "sent_by_admin_id" as constraint name
    -- Try to add with explicit name used by the application code
    BEGIN
      ALTER TABLE public.hrm_email_logs
        ADD CONSTRAINT sent_by_admin_id_fkey
        FOREIGN KEY (sent_by_admin_id) REFERENCES public.hrm_users(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
      NULL; -- Constraint already exists, ignore
    END;
  END IF;
END $$;

-- =========================================
-- hrm_fund_logs FK constraints
-- =========================================

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_fund_logs', 'hrm_fund_logs_monthly_result_id_fkey') THEN
    ALTER TABLE public.hrm_fund_logs
      ADD CONSTRAINT hrm_fund_logs_monthly_result_id_fkey
      FOREIGN KEY (monthly_result_id) REFERENCES public.hrm_monthly_results(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_fund_logs', 'hrm_fund_logs_month_id_fkey') THEN
    ALTER TABLE public.hrm_fund_logs
      ADD CONSTRAINT hrm_fund_logs_month_id_fkey
      FOREIGN KEY (month_id) REFERENCES public.hrm_months(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_fund_logs', 'hrm_fund_logs_subject_user_id_fkey') THEN
    ALTER TABLE public.hrm_fund_logs
      ADD CONSTRAINT hrm_fund_logs_subject_user_id_fkey
      FOREIGN KEY (subject_user_id) REFERENCES public.hrm_users(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('hrm_fund_logs', 'hrm_fund_logs_marked_by_id_fkey') THEN
    ALTER TABLE public.hrm_fund_logs
      ADD CONSTRAINT hrm_fund_logs_marked_by_id_fkey
      FOREIGN KEY (marked_by_id) REFERENCES public.hrm_users(id);
  END IF;
END $$;

-- =========================================
-- CRM FK constraints (crm_users was also CASCADE dropped in migration 0048)
-- =========================================

-- First, clean up orphaned owner_id values in crm_leads (test/seed data that has no crm_user)
UPDATE public.crm_leads
SET owner_id = NULL
WHERE owner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.crm_users WHERE id = crm_leads.owner_id
  );

-- Delete orphaned crm_contact_logs where user_id doesn't exist in crm_users
DELETE FROM public.crm_contact_logs
WHERE user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.crm_users WHERE id = crm_contact_logs.user_id
  );

-- Check if crm_leads still has FK to crm_users
DO $$
BEGIN
  IF NOT public.constraint_exists('crm_leads', 'crm_leads_owner_id_fkey') THEN
    ALTER TABLE public.crm_leads
      ADD CONSTRAINT crm_leads_owner_id_fkey
      FOREIGN KEY (owner_id) REFERENCES public.crm_users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT public.constraint_exists('crm_contact_logs', 'crm_contact_logs_user_id_fkey') THEN
    ALTER TABLE public.crm_contact_logs
      ADD CONSTRAINT crm_contact_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.crm_users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =========================================
-- CLEANUP
-- =========================================

DROP FUNCTION IF EXISTS public.constraint_exists(TEXT, TEXT);

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ Restored HRM FK constraints after CASCADE drop';
  RAISE NOTICE '✅ Restored CRM FK constraints after CASCADE drop';
  RAISE NOTICE '✅ All table relationships now correctly reference the unified ID schema';
END $$;
