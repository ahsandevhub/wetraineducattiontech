-- Migration: Ensure HRM tables exist (safety migration after linking)
-- This migration ensures all HRM enums and tables from 0039-0043 exist
-- Particularly needed when linking an existing Supabase project

-- Create enums first
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hrm_role') THEN
    CREATE TYPE public.hrm_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE');
  END IF;
END $$;

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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hrm_month_status') THEN
    CREATE TYPE public.hrm_month_status AS ENUM ('OPEN', 'LOCKED');
  END IF;
END $$;

-- Create tables
DO $$
BEGIN
  -- Create hrm_users if it doesn't exist  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'hrm_users'
  ) THEN
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
  END IF;

  -- Create hrm_months if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'hrm_months'
   ) THEN
    CREATE TABLE public.hrm_months (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      month_key TEXT NOT NULL UNIQUE,
      year_month DATE NOT NULL UNIQUE,
      status public.hrm_month_status NOT NULL DEFAULT 'OPEN',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX idx_hrm_months_month_key ON public.hrm_months(month_key);
  END IF;

  -- Create hrm_monthly_results if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'hrm_monthly_results'
  ) THEN
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
  END IF;

END $$;
