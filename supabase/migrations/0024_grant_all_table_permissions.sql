-- Grant table permissions for all RLS-enabled tables
-- RLS policies control row-level access, but we need table-level permissions first

-- Services table
GRANT SELECT ON public.services TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;

-- Featured Projects table
GRANT SELECT ON public.featured_projects TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.featured_projects TO authenticated;
GRANT ALL ON public.featured_projects TO service_role;

-- Certifications table
GRANT SELECT ON public.certifications TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;

-- Client Stories table
GRANT SELECT ON public.client_stories TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.client_stories TO authenticated;
GRANT ALL ON public.client_stories TO service_role;

-- Profiles table (already has some permissions but let's ensure all are granted)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Grant sequence permissions for all tables
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
