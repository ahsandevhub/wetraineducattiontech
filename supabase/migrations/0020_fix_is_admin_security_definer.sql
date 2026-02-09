-- Fix the is_admin() function to be SECURITY DEFINER
-- This allows it to read profiles table regardless of RLS policies

DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

CREATE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  );
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
