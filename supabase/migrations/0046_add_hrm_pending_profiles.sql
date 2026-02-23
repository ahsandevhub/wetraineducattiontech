-- =====================================================
-- Migration 0041: HRM Pending Profiles
-- =====================================================
-- Purpose: Allow SUPER_ADMIN to create HRM profiles by email before user registers.
--          On first login, auto-link pending profile to auth user and create hrm_users row.
-- =====================================================

-- Create hrm_pending_profiles table
CREATE TABLE IF NOT EXISTS public.hrm_pending_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Email as identifier (stored lowercase for consistency)
  email text NOT NULL UNIQUE,
  
  -- Profile information
  full_name text NOT NULL,
  
  -- Desired HRM role when user registers
  desired_role text NOT NULL CHECK (desired_role IN ('ADMIN', 'EMPLOYEE')),
  
  -- Status flag
  is_active boolean NOT NULL DEFAULT true,
  
  -- Creator tracking
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Link tracking (null until user registers)
  linked_auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  linked_at timestamptz
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hrm_pending_profiles_email ON public.hrm_pending_profiles(email);
CREATE INDEX IF NOT EXISTS idx_hrm_pending_profiles_linked_auth_id ON public.hrm_pending_profiles(linked_auth_id);
CREATE INDEX IF NOT EXISTS idx_hrm_pending_profiles_created_by ON public.hrm_pending_profiles(created_by);
CREATE INDEX IF NOT EXISTS idx_hrm_pending_profiles_desired_role ON public.hrm_pending_profiles(desired_role);
CREATE INDEX IF NOT EXISTS idx_hrm_pending_profiles_is_active ON public.hrm_pending_profiles(is_active);

-- Enable RLS
ALTER TABLE public.hrm_pending_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only HRM SUPER_ADMIN can manage pending profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_privileges 
    WHERE table_name = 'hrm_pending_profiles' AND privilege_type = 'SELECT'
  ) THEN
    CREATE POLICY "hrm_super_admin_select_pending_profiles"
      ON public.hrm_pending_profiles
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.hrm_users
          WHERE hrm_users.profile_id = auth.uid()
            AND hrm_users.hrm_role = 'SUPER_ADMIN'
            AND hrm_users.is_active = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_pending_profiles' AND policyname = 'hrm_super_admin_insert_pending_profiles'
  ) THEN
    CREATE POLICY "hrm_super_admin_insert_pending_profiles"
      ON public.hrm_pending_profiles
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.hrm_users
          WHERE hrm_users.profile_id = auth.uid()
            AND hrm_users.hrm_role = 'SUPER_ADMIN'
            AND hrm_users.is_active = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_pending_profiles' AND policyname = 'hrm_super_admin_update_pending_profiles'
  ) THEN
    CREATE POLICY "hrm_super_admin_update_pending_profiles"
      ON public.hrm_pending_profiles
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.hrm_users
          WHERE hrm_users.profile_id = auth.uid()
            AND hrm_users.hrm_role = 'SUPER_ADMIN'
            AND hrm_users.is_active = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hrm_pending_profiles' AND policyname = 'hrm_super_admin_delete_pending_profiles'
  ) THEN
    CREATE POLICY "hrm_super_admin_delete_pending_profiles"
      ON public.hrm_pending_profiles
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.hrm_users
          WHERE hrm_users.profile_id = auth.uid()
            AND hrm_users.hrm_role = 'SUPER_ADMIN'
            AND hrm_users.is_active = true
        )
      );
  END IF;
END $$;

-- Grant permissions to service_role for auto-linking logic
GRANT ALL ON public.hrm_pending_profiles TO service_role;

-- Comment
COMMENT ON TABLE public.hrm_pending_profiles IS 'Pending HRM user profiles created before registration. Auto-linked on first login.';
