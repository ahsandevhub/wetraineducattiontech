-- Fix recursive RLS on profiles updates that breaks avatar uploads
-- Root cause: the prior WITH CHECK policy selected from public.profiles inside
-- a profiles policy, which causes Postgres infinite recursion.

BEGIN;

DROP POLICY IF EXISTS "profiles update own no role change" ON public.profiles;
DROP POLICY IF EXISTS "profiles update own" ON public.profiles;

CREATE POLICY "profiles update own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Keep role changes out of normal profile edits while allowing safe field updates
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_change ON public.profiles;

CREATE TRIGGER prevent_profile_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_change();

COMMIT;

NOTIFY pgrst, 'reload schema';
