-- Align hrm_months schema across environments
-- Some environments have year_month (older schema), while newer code uses start_date/end_date.
-- This migration adds start_date/end_date if missing and backfills from year_month.

ALTER TABLE public.hrm_months
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE;

DO $$
BEGIN
  -- Backfill from legacy year_month when that column exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'hrm_months'
      AND column_name = 'year_month'
  ) THEN
    UPDATE public.hrm_months
    SET
      start_date = COALESCE(start_date, date_trunc('month', year_month)::date),
      end_date = COALESCE(
        end_date,
        (date_trunc('month', year_month)::date + INTERVAL '1 month - 1 day')::date
      )
    WHERE year_month IS NOT NULL
      AND (start_date IS NULL OR end_date IS NULL);
  END IF;

  -- Backfill from month_key (YYYY-MM) for environments without year_month
  UPDATE public.hrm_months
  SET
    start_date = COALESCE(start_date, to_date(month_key || '-01', 'YYYY-MM-DD')),
    end_date = COALESCE(
      end_date,
      (date_trunc('month', to_date(month_key || '-01', 'YYYY-MM-DD')) + INTERVAL '1 month - 1 day')::date
    )
  WHERE month_key ~ '^\d{4}-(0[1-9]|1[0-2])$'
    AND (start_date IS NULL OR end_date IS NULL);

  -- Only enforce NOT NULL when data is fully backfilled
  IF NOT EXISTS (
    SELECT 1
    FROM public.hrm_months
    WHERE start_date IS NULL OR end_date IS NULL
  ) THEN
    ALTER TABLE public.hrm_months
      ALTER COLUMN start_date SET NOT NULL,
      ALTER COLUMN end_date SET NOT NULL;
  ELSE
    RAISE NOTICE 'Skipping NOT NULL on hrm_months.start_date/end_date because some rows remain NULL';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_hrm_months_start_date ON public.hrm_months(start_date);
CREATE INDEX IF NOT EXISTS idx_hrm_months_end_date ON public.hrm_months(end_date);
