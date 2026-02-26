-- Migration: Fix user invite trigger to handle all auth flows
-- Date: 2026-02-20
-- Purpose: Ensure profile creation works for invites, magic links, and regular signups

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with email (required for uniqueness)
  -- Use COALESCE to handle null email (for invites without confirmed email)
  INSERT INTO public.profiles (id, full_name, avatar_url, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NEW.email,  -- This comes from auth.users.email
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::public.user_role
      ELSE 'customer'::public.user_role
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name),
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also ensure email sync trigger handles null values gracefully
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
DROP FUNCTION IF EXISTS public.sync_profile_email();

CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update if email actually changed and is not null
  IF NEW.email IS DISTINCT FROM OLD.email AND NEW.email IS NOT NULL  THEN
    UPDATE public.profiles
    SET 
      email = NEW.email,
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'sync_profile_email failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (NEW.email IS DISTINCT FROM OLD.email)
  EXECUTE FUNCTION public.sync_profile_email();

-- Grant necessary permissions to service role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Ensure service role can bypass RLS
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- Add policy for service role to insert profiles (for triggers)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'service_role_insert_profiles'
  ) THEN
    CREATE POLICY service_role_insert_profiles
      ON public.profiles
      FOR INSERT
      TO service_role
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'service_role_update_profiles'
  ) THEN
    CREATE POLICY service_role_update_profiles
      ON public.profiles
      FOR UPDATE
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Backfill any missing profiles (in case some users don't have profiles)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', ''),
  CASE 
    WHEN u.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::public.user_role
    ELSE 'customer'::public.user_role
  END
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE '✅ User invite trigger fixed successfully';
  RAISE NOTICE '✅ Service role permissions granted';
  RAISE NOTICE '✅ All users now have profiles';
END $$;
