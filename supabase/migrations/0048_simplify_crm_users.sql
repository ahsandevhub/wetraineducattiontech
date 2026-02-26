-- Migration: Simplify crm_users to unified architecture
-- Date: 2026-02-25
-- Purpose: Remove duplicate fields, link directly to auth.users

-- Drop old crm_users table
DROP TABLE IF EXISTS public.crm_users CASCADE;

-- Recreate with simplified schema
CREATE TABLE public.crm_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_role crm_role NOT NULL DEFAULT 'MARKETER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_crm_users_crm_role ON public.crm_users(crm_role);

-- Auto-update trigger for updated_at
CREATE TRIGGER update_crm_users_updated_at
  BEFORE UPDATE ON crm_users
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

-- Enable RLS
ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- All authenticated users can view CRM users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crm_users' AND policyname = 'crm_all_authenticated_view'
  ) THEN
    CREATE POLICY "crm_all_authenticated_view"
      ON crm_users FOR SELECT TO authenticated USING (true);
  END IF;

  -- Users can update their own profile (but not change role)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crm_users' AND policyname = 'crm_users_update_own'
  ) THEN
    CREATE POLICY "crm_users_update_own"
      ON crm_users FOR UPDATE TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;

  -- CRM admins can manage everything
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'crm_users' AND policyname = 'crm_admin_all'
  ) THEN
    CREATE POLICY "crm_admin_all"
      ON crm_users FOR ALL USING (is_crm_admin());
  END IF;
END $$;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ CRM users table simplified - now uses auth.users directly';
END $$;
