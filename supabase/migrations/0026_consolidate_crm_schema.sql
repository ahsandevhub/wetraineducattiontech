-- Migration: Consolidate Lead-Pilot CRM into WeTrain Education Supabase
-- Date: 2026-02-16
-- Purpose: Create namespaced CRM tables (crm_*) to avoid conflicts with education schema

-- ============================================================================
-- STEP 1: CREATE CRM ENUMS
-- ============================================================================

-- CRM Role enum (ADMIN, MARKETER)
CREATE TYPE crm_role AS ENUM ('ADMIN', 'MARKETER');

-- Lead Status enum
CREATE TYPE lead_status AS ENUM (
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST'
);

-- Lead Source enum
CREATE TYPE lead_source AS ENUM (
  'ADMIN',
  'WEBSITE',
  'REFERRAL',
  'SOCIAL_MEDIA',
  'OTHER'
);

-- Contact Type enum
CREATE TYPE contact_type AS ENUM (
  'CALL',
  'EMAIL',
  'MEETING',
  'WHATSAPP',
  'OTHER'
);

-- ============================================================================
-- STEP 2: CREATE CRM TABLES
-- ============================================================================

-- CRM Users table (replaces lead-pilot's "users" table)
-- Note: Uses auth.users as the source of truth, this is the CRM profile extension
CREATE TABLE crm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  crm_role crm_role NOT NULL DEFAULT 'MARKETER',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX idx_crm_users_auth_user_id ON crm_users(auth_user_id);
CREATE INDEX idx_crm_users_email ON crm_users(email);
CREATE INDEX idx_crm_users_crm_role ON crm_users(crm_role);

-- CRM Leads table
CREATE TABLE crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT UNIQUE,
  company TEXT,
  status lead_status NOT NULL DEFAULT 'NEW',
  source lead_source NOT NULL DEFAULT 'OTHER',
  owner_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE RESTRICT,
  notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_crm_leads_owner_id ON crm_leads(owner_id);
CREATE INDEX idx_crm_leads_status ON crm_leads(status);
CREATE INDEX idx_crm_leads_created_at ON crm_leads(created_at DESC);
CREATE INDEX idx_crm_leads_email ON crm_leads(email);
CREATE INDEX idx_crm_leads_phone ON crm_leads(phone);

-- CRM Contact Logs table
CREATE TABLE crm_contact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES crm_users(id) ON DELETE RESTRICT,
  contact_type contact_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for filtering and joins
CREATE INDEX idx_crm_contact_logs_lead_id ON crm_contact_logs(lead_id);
CREATE INDEX idx_crm_contact_logs_user_id ON crm_contact_logs(user_id);
CREATE INDEX idx_crm_contact_logs_created_at ON crm_contact_logs(created_at DESC);

-- ============================================================================
-- STEP 3: CREATE AUTO-UPDATE TIMESTAMP TRIGGERS
-- ============================================================================

-- Function to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_crm_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all CRM tables
CREATE TRIGGER update_crm_users_updated_at
  BEFORE UPDATE ON crm_users
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

CREATE TRIGGER update_crm_contact_logs_updated_at
  BEFORE UPDATE ON crm_contact_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_updated_at();

-- ============================================================================
-- STEP 4: CREATE UNIFIED AUTH TRIGGER
-- ============================================================================

-- Drop existing handle_new_user if it exists (from education system)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create unified trigger that populates BOTH profiles and crm_users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  is_admin_email BOOLEAN := false;
BEGIN
  user_email := NEW.email;
  
  -- Check if this is an admin email (customize this list as needed)
  -- You can maintain a separate admin_emails table or hardcode trusted domains
  is_admin_email := user_email LIKE '%@wetraineducation.com' OR 
                    user_email IN (
                      'admin@wetraineducation.com',
                      'super@wetraineducation.com'
                    );
  
  -- Insert into profiles (education system)
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    user_email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN is_admin_email THEN 'admin'::user_role
      ELSE 'customer'::user_role
    END
  );
  
  -- Insert into crm_users (CRM system) - only for internal team
  -- You can add additional logic here to determine CRM access
  IF is_admin_email THEN
    INSERT INTO public.crm_users (auth_user_id, email, full_name, crm_role, is_active)
    VALUES (
      NEW.id,
      user_email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'ADMIN'::crm_role,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- STEP 5: CREATE RLS HELPER FUNCTIONS
-- ============================================================================

-- Check if current user is a CRM admin
CREATE OR REPLACE FUNCTION is_crm_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM crm_users
    WHERE auth_user_id = auth.uid()
      AND crm_role = 'ADMIN'
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current CRM user ID from auth.uid()
CREATE OR REPLACE FUNCTION get_crm_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id
    FROM crm_users
    WHERE auth_user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contact_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: CREATE RLS POLICIES
-- ============================================================================

-- ========== CRM_USERS POLICIES ==========

-- All authenticated users can view CRM users (for lead assignment dropdowns)
CREATE POLICY "crm_users_select_authenticated" ON crm_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own CRM profile (not role or is_active)
CREATE POLICY "crm_users_update_own" ON crm_users
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (
    auth_user_id = auth.uid() 
    AND crm_role = (SELECT crm_role FROM crm_users WHERE auth_user_id = auth.uid())
  );

-- Only service role can insert (done via admin panel or trigger)
CREATE POLICY "crm_users_insert_service" ON crm_users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service role can delete
CREATE POLICY "crm_users_delete_service" ON crm_users
  FOR DELETE
  TO service_role
  USING (true);

-- ========== CRM_LEADS POLICIES ==========

-- Marketers see only their assigned leads, admins see all
CREATE POLICY "crm_leads_select_own_or_admin" ON crm_leads
  FOR SELECT
  TO authenticated
  USING (
    owner_id = get_crm_user_id() OR is_crm_admin()
  );

-- Marketers can insert leads (will be assigned to them or distributed)
CREATE POLICY "crm_leads_insert_authenticated" ON crm_leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM crm_users 
      WHERE auth_user_id = auth.uid() 
        AND is_active = true
    )
  );

-- Marketers can update their own leads, admins can update all
CREATE POLICY "crm_leads_update_own_or_admin" ON crm_leads
  FOR UPDATE
  TO authenticated
  USING (owner_id = get_crm_user_id() OR is_crm_admin())
  WITH CHECK (owner_id = get_crm_user_id() OR is_crm_admin());

-- Admins can delete leads
CREATE POLICY "crm_leads_delete_admin" ON crm_leads
  FOR DELETE
  TO authenticated
  USING (is_crm_admin());

-- ========== CRM_CONTACT_LOGS POLICIES ==========

-- Users can see contact logs for leads they own or if admin
CREATE POLICY "crm_contact_logs_select_own_leads" ON crm_contact_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM crm_leads
      WHERE crm_leads.id = crm_contact_logs.lead_id
        AND (crm_leads.owner_id = get_crm_user_id() OR is_crm_admin())
    )
  );

-- Users can insert contact logs for leads they own
CREATE POLICY "crm_contact_logs_insert_own_leads" ON crm_contact_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM crm_leads
      WHERE crm_leads.id = lead_id
        AND (crm_leads.owner_id = get_crm_user_id() OR is_crm_admin())
    )
  );

-- Users can update their own contact logs
CREATE POLICY "crm_contact_logs_update_own" ON crm_contact_logs
  FOR UPDATE
  TO authenticated
  USING (user_id = get_crm_user_id() OR is_crm_admin())
  WITH CHECK (user_id = get_crm_user_id() OR is_crm_admin());

-- Users can delete their own contact logs
CREATE POLICY "crm_contact_logs_delete_own" ON crm_contact_logs
  FOR DELETE
  TO authenticated
  USING (user_id = get_crm_user_id() OR is_crm_admin());

-- ============================================================================
-- STEP 8: GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on enums
GRANT USAGE ON TYPE crm_role TO authenticated, service_role;
GRANT USAGE ON TYPE lead_status TO authenticated, service_role;
GRANT USAGE ON TYPE lead_source TO authenticated, service_role;
GRANT USAGE ON TYPE contact_type TO authenticated, service_role;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON crm_users TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON crm_leads TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON crm_contact_logs TO authenticated, service_role;

-- Grant sequence permissions if using serial IDs (we use UUIDs, so not needed)
-- But grant for safety
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Validation query to confirm schema is ready
DO $$
BEGIN
  RAISE NOTICE 'CRM Schema Migration Complete!';
  RAISE NOTICE 'Tables created: crm_users, crm_leads, crm_contact_logs';
  RAISE NOTICE 'RLS policies: % enabled', (
    SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('crm_users', 'crm_leads', 'crm_contact_logs')
  );
END $$;
