-- Migration: Restore crm_users profile fields required by CRM UI
-- Date: 2026-03-03
-- Purpose: Add back full_name/email columns removed in 0048 and backfill from existing user data

ALTER TABLE public.crm_users
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill email from auth.users when missing
UPDATE public.crm_users cu
SET email = au.email
FROM auth.users au
WHERE cu.id = au.id
  AND cu.email IS NULL
  AND au.email IS NOT NULL;

-- Backfill full_name from profiles when missing
UPDATE public.crm_users cu
SET full_name = p.full_name
FROM public.profiles p
WHERE cu.id = p.id
  AND cu.full_name IS NULL
  AND p.full_name IS NOT NULL
  AND btrim(p.full_name) <> '';

-- Backfill full_name from auth metadata if still missing
UPDATE public.crm_users cu
SET full_name = COALESCE(
  NULLIF(au.raw_user_meta_data->>'full_name', ''),
  NULLIF(au.raw_user_meta_data->>'name', '')
)
FROM auth.users au
WHERE cu.id = au.id
  AND cu.full_name IS NULL;

-- Optional index for CRM user lookup/filtering
CREATE INDEX IF NOT EXISTS idx_crm_users_email ON public.crm_users(email);

-- Ask PostgREST to reload schema cache so new columns are queryable immediately
NOTIFY pgrst, 'reload schema';
