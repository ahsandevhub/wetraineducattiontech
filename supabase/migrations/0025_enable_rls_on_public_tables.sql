-- Enable RLS on public-facing tables
-- These tables have RLS policies defined but RLS itself was not enabled
-- This ensures consistent security model across all tables

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_stories ENABLE ROW LEVEL SECURITY;
