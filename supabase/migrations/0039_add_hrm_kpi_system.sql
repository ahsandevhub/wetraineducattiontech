-- Migration: Add HRM KPI System
-- Date: 2026-02-18
-- Description: Creates tables and enums for HRM KPI tracking system

-- =========================================
-- ENUMS
-- =========================================

CREATE TYPE public.hrm_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE');
CREATE TYPE public.hrm_week_status AS ENUM ('OPEN', 'LOCKED');
CREATE TYPE public.hrm_month_status AS ENUM ('OPEN', 'LOCKED');
CREATE TYPE public.hrm_compliance_status AS ENUM ('OK', 'MISSED');
CREATE TYPE public.hrm_tier AS ENUM ('BONUS', 'APPRECIATION', 'IMPROVEMENT', 'FINE');
CREATE TYPE public.hrm_action_type AS ENUM ('BONUS', 'GIFT', 'APPRECIATION', 'SHOW_CAUSE', 'FINE', 'NONE');

-- =========================================
-- TABLES
-- =========================================

-- HRM Users
CREATE TABLE public.hrm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE,
  hrm_role public.hrm_role NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hrm_users_profile_id ON public.hrm_users(profile_id);
CREATE INDEX idx_hrm_users_hrm_role ON public.hrm_users(hrm_role);
CREATE INDEX idx_hrm_users_is_active ON public.hrm_users(is_active);

-- HRM Assignments
CREATE TABLE public.hrm_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_admin_id UUID NOT NULL REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  subject_user_id UUID NOT NULL REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by_id UUID NOT NULL REFERENCES public.hrm_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(marker_admin_id, subject_user_id)
);

CREATE INDEX idx_hrm_assignments_marker_admin_id ON public.hrm_assignments(marker_admin_id);
CREATE INDEX idx_hrm_assignments_subject_user_id ON public.hrm_assignments(subject_user_id);
CREATE INDEX idx_hrm_assignments_is_active ON public.hrm_assignments(is_active);

-- HRM Criteria
CREATE TABLE public.hrm_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  default_scale_max INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HRM Subject Criteria Sets
CREATE TABLE public.hrm_subject_criteria_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id UUID NOT NULL REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  active_from DATE NOT NULL,
  active_to DATE,
  created_by_id UUID NOT NULL REFERENCES public.hrm_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hrm_subject_criteria_sets_subject_user_id ON public.hrm_subject_criteria_sets(subject_user_id);
CREATE INDEX idx_hrm_subject_criteria_sets_active_from ON public.hrm_subject_criteria_sets(active_from);

-- HRM Subject Criteria Items
CREATE TABLE public.hrm_subject_criteria_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criteria_set_id UUID NOT NULL REFERENCES public.hrm_subject_criteria_sets(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES public.hrm_criteria(id),
  weight INTEGER NOT NULL,
  scale_max INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(criteria_set_id, criteria_id)
);

CREATE INDEX idx_hrm_subject_criteria_items_criteria_set_id ON public.hrm_subject_criteria_items(criteria_set_id);

-- HRM Weeks
CREATE TABLE public.hrm_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_key TEXT NOT NULL UNIQUE,
  friday_date DATE NOT NULL UNIQUE,
  status public.hrm_week_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hrm_weeks_status ON public.hrm_weeks(status);
CREATE INDEX idx_hrm_weeks_friday_date ON public.hrm_weeks(friday_date);

-- HRM KPI Submissions
CREATE TABLE public.hrm_kpi_submissions (
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

CREATE INDEX idx_hrm_kpi_submissions_week_id ON public.hrm_kpi_submissions(week_id);
CREATE INDEX idx_hrm_kpi_submissions_marker_admin_id ON public.hrm_kpi_submissions(marker_admin_id);
CREATE INDEX idx_hrm_kpi_submissions_subject_user_id ON public.hrm_kpi_submissions(subject_user_id);

-- HRM KPI Submission Items
CREATE TABLE public.hrm_kpi_submission_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.hrm_kpi_submissions(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES public.hrm_criteria(id),
  score_raw DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(submission_id, criteria_id)
);

CREATE INDEX idx_hrm_kpi_submission_items_submission_id ON public.hrm_kpi_submission_items(submission_id);

-- HRM Weekly Results
CREATE TABLE public.hrm_weekly_results (
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

CREATE INDEX idx_hrm_weekly_results_week_id ON public.hrm_weekly_results(week_id);
CREATE INDEX idx_hrm_weekly_results_subject_user_id ON public.hrm_weekly_results(subject_user_id);

-- HRM Admin Compliance
CREATE TABLE public.hrm_admin_compliance (
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

CREATE INDEX idx_hrm_admin_compliance_week_id ON public.hrm_admin_compliance(week_id);
CREATE INDEX idx_hrm_admin_compliance_admin_id ON public.hrm_admin_compliance(admin_id);
CREATE INDEX idx_hrm_admin_compliance_status ON public.hrm_admin_compliance(status);

-- HRM Months
CREATE TABLE public.hrm_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status public.hrm_month_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hrm_months_status ON public.hrm_months(status);
CREATE INDEX idx_hrm_months_month_key ON public.hrm_months(month_key);

-- HRM Monthly Results
CREATE TABLE public.hrm_monthly_results (
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
  UNIQUE(month_id, subject_user_id)
);

CREATE INDEX idx_hrm_monthly_results_month_id ON public.hrm_monthly_results(month_id);
CREATE INDEX idx_hrm_monthly_results_subject_user_id ON public.hrm_monthly_results(subject_user_id);
CREATE INDEX idx_hrm_monthly_results_tier ON public.hrm_monthly_results(tier);

-- HRM Subject Month State
CREATE TABLE public.hrm_subject_month_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id UUID NOT NULL UNIQUE REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  last_month_key TEXT,
  last_month_tier public.hrm_tier,
  consecutive_improvement_months INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_hrm_subject_month_states_subject_user_id ON public.hrm_subject_month_states(subject_user_id);

-- =========================================
-- RLS POLICIES (Enable RLS and add basic policies)
-- =========================================

ALTER TABLE public.hrm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_subject_criteria_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_subject_criteria_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_kpi_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_kpi_submission_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_weekly_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_admin_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_monthly_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hrm_subject_month_states ENABLE ROW LEVEL SECURITY;

-- Temporary policies for development (allow all for authenticated users)
-- TODO: Implement proper role-based policies later

CREATE POLICY "Enable all for authenticated users" ON public.hrm_users FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_assignments FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_criteria FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_subject_criteria_sets FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_subject_criteria_items FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_weeks FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_kpi_submissions FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_kpi_submission_items FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_weekly_results FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_admin_compliance FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_months FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_monthly_results FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON public.hrm_subject_month_states FOR ALL USING (true);

-- =========================================
-- GRANTS (Allow service role access)
-- =========================================

GRANT ALL ON public.hrm_users TO service_role;
GRANT ALL ON public.hrm_assignments TO service_role;
GRANT ALL ON public.hrm_criteria TO service_role;
GRANT ALL ON public.hrm_subject_criteria_sets TO service_role;
GRANT ALL ON public.hrm_subject_criteria_items TO service_role;
GRANT ALL ON public.hrm_weeks TO service_role;
GRANT ALL ON public.hrm_kpi_submissions TO service_role;
GRANT ALL ON public.hrm_kpi_submission_items TO service_role;
GRANT ALL ON public.hrm_weekly_results TO service_role;
GRANT ALL ON public.hrm_admin_compliance TO service_role;
GRANT ALL ON public.hrm_months TO service_role;
GRANT ALL ON public.hrm_monthly_results TO service_role;
GRANT ALL ON public.hrm_subject_month_states TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_assignments TO authenticated;
GRANT SELECT ON public.hrm_criteria TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_subject_criteria_sets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_subject_criteria_items TO authenticated;
GRANT SELECT ON public.hrm_weeks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_kpi_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_kpi_submission_items TO authenticated;
GRANT SELECT ON public.hrm_weekly_results TO authenticated;
GRANT SELECT ON public.hrm_admin_compliance TO authenticated;
GRANT SELECT ON public.hrm_months TO authenticated;
GRANT SELECT ON public.hrm_monthly_results TO authenticated;
GRANT SELECT ON public.hrm_subject_month_states TO authenticated;

-- Grant usage on enum types
GRANT USAGE ON TYPE public.hrm_role TO service_role, authenticated;
GRANT USAGE ON TYPE public.hrm_week_status TO service_role, authenticated;
GRANT USAGE ON TYPE public.hrm_month_status TO service_role, authenticated;
GRANT USAGE ON TYPE public.hrm_compliance_status TO service_role, authenticated;
GRANT USAGE ON TYPE public.hrm_tier TO service_role, authenticated;
GRANT USAGE ON TYPE public.hrm_action_type TO service_role, authenticated;
