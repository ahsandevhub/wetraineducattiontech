-- Migration: Add HRM task reporting
-- Date: 2026-04-14
-- Purpose: Allow HRM employees, admins, and super admins to record regular task activity

CREATE TABLE IF NOT EXISTS public.hrm_task_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id UUID NOT NULL REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  task_title TEXT NOT NULL,
  proof_url TEXT,
  notes TEXT,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hrm_task_reports_category_check CHECK (
    category IN (
      'Customer Handling',
      'KYC Check',
      'Review',
      'Follow-up',
      'Documentation',
      'Meeting',
      'Support',
      'Other'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_hrm_task_reports_author_user_id
  ON public.hrm_task_reports(author_user_id);
CREATE INDEX IF NOT EXISTS idx_hrm_task_reports_reported_at_desc
  ON public.hrm_task_reports(reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_hrm_task_reports_category
  ON public.hrm_task_reports(category);
CREATE INDEX IF NOT EXISTS idx_hrm_task_reports_author_reported_at_desc
  ON public.hrm_task_reports(author_user_id, reported_at DESC);

ALTER TABLE public.hrm_task_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hrm_task_reports_select_policy" ON public.hrm_task_reports;
DROP POLICY IF EXISTS "hrm_task_reports_insert_policy" ON public.hrm_task_reports;
DROP POLICY IF EXISTS "hrm_task_reports_update_policy" ON public.hrm_task_reports;
DROP POLICY IF EXISTS "hrm_task_reports_delete_policy" ON public.hrm_task_reports;

CREATE POLICY "hrm_task_reports_select_policy"
  ON public.hrm_task_reports
  FOR SELECT
  USING (
    author_user_id = auth.uid()
    OR public.get_my_hrm_role() = 'SUPER_ADMIN'
    OR (
      public.get_my_hrm_role() = 'ADMIN'
      AND EXISTS (
        SELECT 1
        FROM public.hrm_assignments assignment
        WHERE assignment.marker_admin_id = auth.uid()
          AND assignment.subject_user_id = hrm_task_reports.author_user_id
          AND assignment.is_active = true
      )
    )
  );

CREATE POLICY "hrm_task_reports_insert_policy"
  ON public.hrm_task_reports
  FOR INSERT
  WITH CHECK (
    author_user_id = auth.uid()
    AND public.get_my_hrm_role() IN ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN')
  );

CREATE POLICY "hrm_task_reports_update_policy"
  ON public.hrm_task_reports
  FOR UPDATE
  USING (
    (
      author_user_id = auth.uid()
      AND public.get_my_hrm_role() IN ('EMPLOYEE', 'ADMIN')
    )
    OR public.get_my_hrm_role() = 'SUPER_ADMIN'
  )
  WITH CHECK (
    (
      author_user_id = auth.uid()
      AND public.get_my_hrm_role() IN ('EMPLOYEE', 'ADMIN')
    )
    OR public.get_my_hrm_role() = 'SUPER_ADMIN'
  );

CREATE POLICY "hrm_task_reports_delete_policy"
  ON public.hrm_task_reports
  FOR DELETE
  USING (
    (
      author_user_id = auth.uid()
      AND public.get_my_hrm_role() IN ('EMPLOYEE', 'ADMIN')
    )
    OR public.get_my_hrm_role() = 'SUPER_ADMIN'
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hrm_task_reports TO authenticated;
GRANT ALL ON public.hrm_task_reports TO service_role;

COMMENT ON TABLE public.hrm_task_reports IS 'Regular HRM task/activity reports entered by employees, admins, and reviewed across HRM hierarchy';
