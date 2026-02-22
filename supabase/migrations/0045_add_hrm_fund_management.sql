-- Migration: Add HRM fund management ledger
-- Date: 2026-02-23
-- Description: Adds fund logs for fine collection and bonus payment tracking

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'hrm_fund_entry_type'
  ) THEN
    CREATE TYPE public.hrm_fund_entry_type AS ENUM ('FINE', 'BONUS');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'hrm_fund_status'
  ) THEN
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
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'hrm_fund_logs'
      AND policyname = 'Enable all for authenticated users'
  ) THEN
    CREATE POLICY "Enable all for authenticated users"
      ON public.hrm_fund_logs
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_fund_logs TO service_role;

COMMENT ON TABLE public.hrm_fund_logs IS 'Ledger table for monthly fine and bonus settlements';
COMMENT ON COLUMN public.hrm_fund_logs.status IS 'DUE for pending, COLLECTED for fine collected, PAID for bonus paid';
COMMENT ON COLUMN public.hrm_fund_logs.expected_amount IS 'Fine/bonus amount from monthly KPI computation';
COMMENT ON COLUMN public.hrm_fund_logs.actual_amount IS 'Actual settled amount; required for bonus payment';
