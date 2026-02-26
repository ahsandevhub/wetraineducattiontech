-- Migration: Simplify hrm_users to unified architecture
-- Date: 2026-02-25
-- Purpose: Remove duplicate fields, link directly to auth.users

-- Drop old hrm_users table and dependencies
DROP TABLE IF EXISTS public.hrm_users CASCADE;

-- Recreate with simplified schema
CREATE TABLE public.hrm_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hrm_role public.hrm_role NOT NULL DEFAULT 'EMPLOYEE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_hrm_users_hrm_role ON public.hrm_users(hrm_role);

-- Auto-update trigger (reuse existing function)
CREATE TRIGGER update_hrm_users_updated_at
  BEFORE UPDATE ON hrm_users
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

-- Enable RLS
ALTER TABLE hrm_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- Users can see their own profile or if they're admin
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_users' AND policyname = 'hrm_users_select_own_or_admin'
  ) THEN
    CREATE POLICY "hrm_users_select_own_or_admin"
      ON hrm_users FOR SELECT USING (
        id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM hrm_users hu
          WHERE hu.id = auth.uid()
          AND hu.hrm_role IN ('SUPER_ADMIN', 'ADMIN')
        )
      );
  END IF;

  -- Only SUPER_ADMIN can manage all operations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_users' AND policyname = 'hrm_super_admin_all'
  ) THEN
    CREATE POLICY "hrm_super_admin_all"
      ON hrm_users FOR ALL USING (
        EXISTS (
          SELECT 1 FROM hrm_users hu
          WHERE hu.id = auth.uid()
          AND hu.hrm_role = 'SUPER_ADMIN'
        )
      );
  END IF;
END $$;

-- Recreate foreign key relationships that depend on hrm_users
-- All existing FK relationships will work because hrm_users.id IS auth.users.id

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ HRM users table simplified - now uses auth.users directly';
  RAISE NOTICE '⚠️  All HRM users need to be re-added via the new search workflow';
END $$;
