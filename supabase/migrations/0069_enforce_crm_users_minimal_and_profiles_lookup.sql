-- Migration: Enforce minimal crm_users schema and profiles-based identity fields
-- Date: 2026-03-03
-- Purpose: Keep crm_users as role mapping only, and use profiles for full_name/email

-- 1) Ensure CRM users can read profile names/emails for assignment and logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'profiles select for crm users'
  ) THEN
    CREATE POLICY "profiles select for crm users"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.crm_users cu
          WHERE cu.id = auth.uid()
        )
      );
  END IF;
END $$;

-- 2) Keep crm_users minimal (id/role/timestamps only)
ALTER TABLE public.crm_users
  DROP COLUMN IF EXISTS full_name,
  DROP COLUMN IF EXISTS email;

-- 3) Cleanup optional index from prior compatibility migration
DROP INDEX IF EXISTS public.idx_crm_users_email;

-- 4) Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
