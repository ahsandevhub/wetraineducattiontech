-- Migration: Recreate HRM KPI tables after CASCADE drop
-- Date: 2026-02-26
-- Problem: Migration 0049 used DROP TABLE hrm_users CASCADE which dropped ALL tables
--          that had FK references to hrm_users.id. This migration recreates them all.
-- Note: hrm_users.id IS NOW auth.users.id (direct link, same UUID)
--       hrm_criteria, hrm_weeks, hrm_months survived (no FK to hrm_users)

-- =========================================
-- RECREATE DROPPED TABLES (IF NOT EXISTS)
-- =========================================

-- 1. hrm_assignments
CREATE TABLE IF NOT EXISTS public.hrm_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_admin_id UUID NOT NULL REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  subject_user_id UUID NOT NULL REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by_id UUID NOT NULL REFERENCES public.hrm_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(marker_admin_id, subject_user_id)
);

CREATE INDEX IF NOT EXISTS idx_hrm_assignments_marker_admin_id ON public.hrm_assignments(marker_admin_id);
CREATE INDEX IF NOT EXISTS idx_hrm_assignments_subject_user_id ON public.hrm_assignments(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_hrm_assignments_is_active ON public.hrm_assignments(is_active);

ALTER TABLE public.hrm_assignments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_assignments' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_assignments FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_assignments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_assignments TO authenticated;

-- 2. hrm_criteria (may already exist, using IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.hrm_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  default_scale_max INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hrm_criteria ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_criteria' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_criteria FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_criteria TO service_role;
GRANT SELECT ON public.hrm_criteria TO authenticated;

-- 3. hrm_subject_criteria_sets
CREATE TABLE IF NOT EXISTS public.hrm_subject_criteria_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id UUID NOT NULL REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  active_from DATE NOT NULL,
  active_to DATE,
  created_by_id UUID NOT NULL REFERENCES public.hrm_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hrm_subject_criteria_sets_subject_user_id ON public.hrm_subject_criteria_sets(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_hrm_subject_criteria_sets_active_from ON public.hrm_subject_criteria_sets(active_from);

ALTER TABLE public.hrm_subject_criteria_sets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_subject_criteria_sets' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_subject_criteria_sets FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_subject_criteria_sets TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_subject_criteria_sets TO authenticated;

-- 4. hrm_subject_criteria_items
CREATE TABLE IF NOT EXISTS public.hrm_subject_criteria_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criteria_set_id UUID NOT NULL REFERENCES public.hrm_subject_criteria_sets(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES public.hrm_criteria(id),
  weight INTEGER NOT NULL,
  scale_max INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(criteria_set_id, criteria_id)
);

CREATE INDEX IF NOT EXISTS idx_hrm_subject_criteria_items_criteria_set_id ON public.hrm_subject_criteria_items(criteria_set_id);

ALTER TABLE public.hrm_subject_criteria_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_subject_criteria_items' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_subject_criteria_items FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_subject_criteria_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_subject_criteria_items TO authenticated;

-- 5. hrm_weeks (may already exist, using IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hrm_week_status') THEN
    CREATE TYPE public.hrm_week_status AS ENUM ('OPEN', 'LOCKED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.hrm_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_key TEXT NOT NULL UNIQUE,
  friday_date DATE NOT NULL UNIQUE,
  status public.hrm_week_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hrm_weeks_status ON public.hrm_weeks(status);
CREATE INDEX IF NOT EXISTS idx_hrm_weeks_friday_date ON public.hrm_weeks(friday_date);

ALTER TABLE public.hrm_weeks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_weeks' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_weeks FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_weeks TO service_role;
GRANT SELECT ON public.hrm_weeks TO authenticated;

-- 6. hrm_kpi_submissions
CREATE TABLE IF NOT EXISTS public.hrm_kpi_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES public.hrm_weeks(id) ON DELETE CASCADE,
  marker_admin_id UUID NOT NULL REFERENCES public.hrm_users(id),
  subject_user_id UUID NOT NULL REFERENCES public.hrm_users(id),
  total_score DECIMAL(10, 2) NOT NULL,
  comment TEXT,
  submitted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(week_id, marker_admin_id, subject_user_id)
);

CREATE INDEX IF NOT EXISTS idx_hrm_kpi_submissions_week_id ON public.hrm_kpi_submissions(week_id);
CREATE INDEX IF NOT EXISTS idx_hrm_kpi_submissions_marker_admin_id ON public.hrm_kpi_submissions(marker_admin_id);
CREATE INDEX IF NOT EXISTS idx_hrm_kpi_submissions_subject_user_id ON public.hrm_kpi_submissions(subject_user_id);

ALTER TABLE public.hrm_kpi_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_kpi_submissions' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_kpi_submissions FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_kpi_submissions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_kpi_submissions TO authenticated;

-- 7. hrm_kpi_submission_items
CREATE TABLE IF NOT EXISTS public.hrm_kpi_submission_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.hrm_kpi_submissions(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES public.hrm_criteria(id),
  score_raw DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(submission_id, criteria_id)
);

CREATE INDEX IF NOT EXISTS idx_hrm_kpi_submission_items_submission_id ON public.hrm_kpi_submission_items(submission_id);

ALTER TABLE public.hrm_kpi_submission_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_kpi_submission_items' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_kpi_submission_items FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_kpi_submission_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_kpi_submission_items TO authenticated;

-- 8. hrm_weekly_results
CREATE TABLE IF NOT EXISTS public.hrm_weekly_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES public.hrm_weeks(id) ON DELETE CASCADE,
  subject_user_id UUID NOT NULL REFERENCES public.hrm_users(id),
  weekly_avg_score DECIMAL(10, 2) NOT NULL,
  expected_markers_count INTEGER NOT NULL,
  submitted_markers_count INTEGER NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  computed_at TIMESTAMPTZ NOT NULL,
  UNIQUE(week_id, subject_user_id)
);

CREATE INDEX IF NOT EXISTS idx_hrm_weekly_results_week_id ON public.hrm_weekly_results(week_id);
CREATE INDEX IF NOT EXISTS idx_hrm_weekly_results_subject_user_id ON public.hrm_weekly_results(subject_user_id);

ALTER TABLE public.hrm_weekly_results ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_weekly_results' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_weekly_results FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_weekly_results TO service_role;
GRANT SELECT ON public.hrm_weekly_results TO authenticated;

-- 9. hrm_admin_compliance
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hrm_compliance_status') THEN
    CREATE TYPE public.hrm_compliance_status AS ENUM ('OK', 'MISSED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.hrm_admin_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES public.hrm_weeks(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.hrm_users(id),
  expected_count INTEGER NOT NULL,
  submitted_count INTEGER NOT NULL,
  missed_count INTEGER NOT NULL,
  status public.hrm_compliance_status NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL,
  UNIQUE(week_id, admin_id)
);

CREATE INDEX IF NOT EXISTS idx_hrm_admin_compliance_week_id ON public.hrm_admin_compliance(week_id);
CREATE INDEX IF NOT EXISTS idx_hrm_admin_compliance_admin_id ON public.hrm_admin_compliance(admin_id);
CREATE INDEX IF NOT EXISTS idx_hrm_admin_compliance_status ON public.hrm_admin_compliance(status);

ALTER TABLE public.hrm_admin_compliance ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_admin_compliance' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_admin_compliance FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_admin_compliance TO service_role;
GRANT SELECT ON public.hrm_admin_compliance TO authenticated;

-- 10. hrm_months (may already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hrm_month_status') THEN
    CREATE TYPE public.hrm_month_status AS ENUM ('OPEN', 'LOCKED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.hrm_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status public.hrm_month_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hrm_months_status ON public.hrm_months(status);
CREATE INDEX IF NOT EXISTS idx_hrm_months_month_key ON public.hrm_months(month_key);

ALTER TABLE public.hrm_months ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_months' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_months FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_months TO service_role;
GRANT SELECT ON public.hrm_months TO authenticated;

-- 11. hrm_monthly_results (includes columns from migration 0040)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hrm_tier') THEN
    CREATE TYPE public.hrm_tier AS ENUM ('BONUS', 'APPRECIATION', 'IMPROVEMENT', 'FINE');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hrm_action_type') THEN
    CREATE TYPE public.hrm_action_type AS ENUM ('BONUS', 'GIFT', 'APPRECIATION', 'SHOW_CAUSE', 'FINE', 'NONE');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.hrm_monthly_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id UUID NOT NULL REFERENCES public.hrm_months(id) ON DELETE CASCADE,
  subject_user_id UUID NOT NULL REFERENCES public.hrm_users(id),
  monthly_score DECIMAL(10, 2) NOT NULL,
  tier public.hrm_tier NOT NULL,
  action_type public.hrm_action_type NOT NULL,
  base_fine INTEGER NOT NULL DEFAULT 0,
  month_fine_count INTEGER NOT NULL DEFAULT 0,
  final_fine INTEGER NOT NULL DEFAULT 0,
  gift_amount INTEGER,
  computed_at TIMESTAMPTZ NOT NULL,
  -- Columns from migration 0040
  weeks_count_used INTEGER NOT NULL DEFAULT 0,
  expected_weeks_count INTEGER NOT NULL DEFAULT 0,
  is_complete_month BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(month_id, subject_user_id)
);

CREATE INDEX IF NOT EXISTS idx_hrm_monthly_results_month_id ON public.hrm_monthly_results(month_id);
CREATE INDEX IF NOT EXISTS idx_hrm_monthly_results_subject_user_id ON public.hrm_monthly_results(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_hrm_monthly_results_tier ON public.hrm_monthly_results(tier);
CREATE INDEX IF NOT EXISTS idx_hrm_monthly_results_is_complete_month ON public.hrm_monthly_results(is_complete_month);

ALTER TABLE public.hrm_monthly_results ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_monthly_results' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_monthly_results FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_monthly_results TO service_role;
GRANT SELECT ON public.hrm_monthly_results TO authenticated;

-- 12. hrm_subject_month_states
CREATE TABLE IF NOT EXISTS public.hrm_subject_month_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id UUID NOT NULL UNIQUE REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  last_month_key TEXT,
  last_month_tier public.hrm_tier,
  consecutive_improvement_months INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hrm_subject_month_states_subject_user_id ON public.hrm_subject_month_states(subject_user_id);

ALTER TABLE public.hrm_subject_month_states ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_subject_month_states' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_subject_month_states FOR ALL USING (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_subject_month_states TO service_role;
GRANT SELECT ON public.hrm_subject_month_states TO authenticated;

-- 13. hrm_email_logs (with fixed RLS - uses id instead of profile_id)
CREATE TABLE IF NOT EXISTS public.hrm_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id UUID NOT NULL REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  month_id UUID NOT NULL REFERENCES public.hrm_months(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL DEFAULT 'MARKSHEET',
  subject_line TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  sent_by_admin_id UUID REFERENCES public.hrm_users(id) ON DELETE SET NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  delivery_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  delivery_error TEXT,
  opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_subject_user_id ON public.hrm_email_logs(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_month_id ON public.hrm_email_logs(month_id);
CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_sent_at ON public.hrm_email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_email_type ON public.hrm_email_logs(email_type);

ALTER TABLE public.hrm_email_logs ENABLE ROW LEVEL SECURITY;

-- Fixed RLS: use id = auth.uid() directly instead of profile_id lookup (old schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_email_logs' AND policyname = 'Allow users to view their own email logs'
  ) THEN
    CREATE POLICY "Allow users to view their own email logs" ON public.hrm_email_logs
    FOR SELECT USING (
      auth.uid() = subject_user_id
      OR public.get_my_hrm_role() = 'SUPER_ADMIN'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_email_logs' AND policyname = 'Allow SUPER_ADMIN to create email logs'
  ) THEN
    CREATE POLICY "Allow SUPER_ADMIN to create email logs" ON public.hrm_email_logs
    FOR INSERT WITH CHECK (
      public.get_my_hrm_role() = 'SUPER_ADMIN'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_email_logs' AND policyname = 'Allow SUPER_ADMIN to update email logs'
  ) THEN
    CREATE POLICY "Allow SUPER_ADMIN to update email logs" ON public.hrm_email_logs
    FOR UPDATE USING (
      public.get_my_hrm_role() = 'SUPER_ADMIN'
    );
  END IF;
END $$;

GRANT SELECT ON public.hrm_email_logs TO authenticated;
GRANT INSERT, UPDATE ON public.hrm_email_logs TO service_role;
GRANT ALL ON public.hrm_email_logs TO service_role;

-- 14. hrm_fund_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hrm_fund_entry_type') THEN
    CREATE TYPE public.hrm_fund_entry_type AS ENUM ('FINE', 'BONUS');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hrm_fund_status') THEN
    CREATE TYPE public.hrm_fund_status AS ENUM ('DUE', 'COLLECTED', 'PAID');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.hrm_fund_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_result_id UUID NOT NULL REFERENCES public.hrm_monthly_results(id) ON DELETE CASCADE,
  month_id UUID NOT NULL REFERENCES public.hrm_months(id) ON DELETE CASCADE,
  subject_user_id UUID NOT NULL REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  entry_type public.hrm_fund_entry_type NOT NULL,
  status public.hrm_fund_status NOT NULL DEFAULT 'DUE',
  expected_amount INTEGER NOT NULL DEFAULT 0 CHECK (expected_amount >= 0),
  actual_amount INTEGER CHECK (actual_amount IS NULL OR actual_amount >= 0),
  note TEXT,
  marked_by_id UUID REFERENCES public.hrm_users(id),
  marked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(monthly_result_id, entry_type)
);

CREATE INDEX IF NOT EXISTS idx_hrm_fund_logs_month_id ON public.hrm_fund_logs(month_id);
CREATE INDEX IF NOT EXISTS idx_hrm_fund_logs_subject_user_id ON public.hrm_fund_logs(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_hrm_fund_logs_entry_type ON public.hrm_fund_logs(entry_type);
CREATE INDEX IF NOT EXISTS idx_hrm_fund_logs_status ON public.hrm_fund_logs(status);
CREATE INDEX IF NOT EXISTS idx_hrm_fund_logs_marked_at ON public.hrm_fund_logs(marked_at DESC);

ALTER TABLE public.hrm_fund_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_fund_logs' AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users" ON public.hrm_fund_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_fund_logs TO service_role;

-- =========================================
-- GRANT ENUM TYPES
-- =========================================
GRANT USAGE ON TYPE public.hrm_week_status TO service_role, authenticated;
GRANT USAGE ON TYPE public.hrm_month_status TO service_role, authenticated;
GRANT USAGE ON TYPE public.hrm_compliance_status TO service_role, authenticated;
GRANT USAGE ON TYPE public.hrm_tier TO service_role, authenticated;
GRANT USAGE ON TYPE public.hrm_action_type TO service_role, authenticated;
GRANT USAGE ON TYPE public.hrm_fund_entry_type TO service_role, authenticated;
GRANT USAGE ON TYPE public.hrm_fund_status TO service_role, authenticated;

-- =========================================
-- LOG COMPLETION
-- =========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Recreated HRM KPI tables after CASCADE drop from migration 0049';
  RAISE NOTICE '✅ Fixed hrm_email_logs RLS to use id instead of profile_id';
  RAISE NOTICE '✅ hrm_monthly_results includes week tracking columns from migration 0040';
  RAISE NOTICE '✅ All FK relationships now correctly reference hrm_users.id = auth.users.id';
END $$;
