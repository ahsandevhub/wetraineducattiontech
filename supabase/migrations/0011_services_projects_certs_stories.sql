-- Services, projects, certifications, and client stories
-- Includes storage buckets + policies and admin CRUD policies

-- Service categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'service_category' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.service_category AS ENUM (
      'course',
      'software',
      'marketing'
    );
  END IF;
END $$;

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category public.service_category NOT NULL,
  price numeric,
  discount numeric,
  currency text NOT NULL DEFAULT 'BDT',
  details text,
  key_features text[] DEFAULT ARRAY[]::text[],
  featured_image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Featured projects table
CREATE TABLE IF NOT EXISTS public.featured_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  description text NOT NULL,
  tech_stack text[] DEFAULT ARRAY[]::text[],
  featured_image_url text NOT NULL,
  live_url text,
  github_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Certifications table
CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL,
  issued_at text NOT NULL,
  description text NOT NULL,
  credential_id text,
  verify_url text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Client stories table
CREATE TABLE IF NOT EXISTS public.client_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  quote text NOT NULL,
  achievement text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_stories ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent)
DO $$
BEGIN
  -- Services
  BEGIN
    EXECUTE 'create policy "services select all" on public.services for select using (true)';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "services insert admin" on public.services for insert with check (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "services update admin" on public.services for update using (public.is_admin()) with check (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "services delete admin" on public.services for delete using (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- Featured projects
  BEGIN
    EXECUTE 'create policy "projects select all" on public.featured_projects for select using (true)';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "projects insert admin" on public.featured_projects for insert with check (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "projects update admin" on public.featured_projects for update using (public.is_admin()) with check (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "projects delete admin" on public.featured_projects for delete using (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- Certifications
  BEGIN
    EXECUTE 'create policy "certifications select all" on public.certifications for select using (true)';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "certifications insert admin" on public.certifications for insert with check (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "certifications update admin" on public.certifications for update using (public.is_admin()) with check (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "certifications delete admin" on public.certifications for delete using (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- Client stories
  BEGIN
    EXECUTE 'create policy "stories select all" on public.client_stories for select using (true)';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "stories insert admin" on public.client_stories for insert with check (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "stories update admin" on public.client_stories for update using (public.is_admin()) with check (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "stories delete admin" on public.client_stories for delete using (public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('services', 'services', true),
  ('projects', 'projects', true),
  ('certifications', 'certifications', true),
  ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (public read + admin write)
DO $$
BEGIN
  -- Services bucket
  BEGIN
    EXECUTE 'create policy "services images read" on storage.objects for select using (bucket_id = ''services'')';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "services images insert admin" on storage.objects for insert with check (bucket_id = ''services'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "services images update admin" on storage.objects for update using (bucket_id = ''services'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "services images delete admin" on storage.objects for delete using (bucket_id = ''services'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- Projects bucket
  BEGIN
    EXECUTE 'create policy "projects images read" on storage.objects for select using (bucket_id = ''projects'')';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "projects images insert admin" on storage.objects for insert with check (bucket_id = ''projects'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "projects images update admin" on storage.objects for update using (bucket_id = ''projects'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "projects images delete admin" on storage.objects for delete using (bucket_id = ''projects'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- Certifications bucket
  BEGIN
    EXECUTE 'create policy "certifications images read" on storage.objects for select using (bucket_id = ''certifications'')';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "certifications images insert admin" on storage.objects for insert with check (bucket_id = ''certifications'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "certifications images update admin" on storage.objects for update using (bucket_id = ''certifications'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "certifications images delete admin" on storage.objects for delete using (bucket_id = ''certifications'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;

  -- Stories bucket
  BEGIN
    EXECUTE 'create policy "stories images read" on storage.objects for select using (bucket_id = ''stories'')';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "stories images insert admin" on storage.objects for insert with check (bucket_id = ''stories'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "stories images update admin" on storage.objects for update using (bucket_id = ''stories'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'create policy "stories images delete admin" on storage.objects for delete using (bucket_id = ''stories'' and public.is_admin())';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
