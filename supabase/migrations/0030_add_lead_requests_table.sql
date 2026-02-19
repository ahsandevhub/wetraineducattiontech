-- Add Lead Requests Table for Marketer Request Workflow
-- Marketers request admin to create leads. Admins review and approve/decline.

CREATE TABLE IF NOT EXISTS crm_lead_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES crm_users(id) ON DELETE RESTRICT,
  lead_payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DECLINED')),
  admin_note text,
  reviewed_by uuid REFERENCES crm_users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_crm_lead_requests_status_created_at 
  ON crm_lead_requests(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_lead_requests_requester_id 
  ON crm_lead_requests(requester_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_crm_lead_requests_reviewed_at 
  ON crm_lead_requests(reviewed_at DESC);

-- Enable RLS
ALTER TABLE crm_lead_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Marketers can insert their own requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'crm_lead_requests' 
    AND policyname = 'crm_lead_requests_marketer_insert'
  ) THEN
    CREATE POLICY crm_lead_requests_marketer_insert 
      ON crm_lead_requests
      FOR INSERT
      WITH CHECK (
        auth.uid() = (SELECT auth_user_id FROM crm_users WHERE id = requester_id)
      );
  END IF;
END $$;

-- Policy: Marketers can view their own requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'crm_lead_requests' 
    AND policyname = 'crm_lead_requests_marketer_select'
  ) THEN
    CREATE POLICY crm_lead_requests_marketer_select 
      ON crm_lead_requests
      FOR SELECT
      USING (
        auth.uid() = (SELECT auth_user_id FROM crm_users WHERE id = requester_id)
      );
  END IF;
END $$;

-- Policy: Admins can view all requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'crm_lead_requests' 
    AND policyname = 'crm_lead_requests_admin_select'
  ) THEN
    CREATE POLICY crm_lead_requests_admin_select 
      ON crm_lead_requests
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM crm_users 
          WHERE crm_users.auth_user_id = auth.uid() 
          AND crm_users.crm_role = 'ADMIN'
        )
      );
  END IF;
END $$;

-- Policy: Admins can update requests (review/approve/decline)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'crm_lead_requests' 
    AND policyname = 'crm_lead_requests_admin_update'
  ) THEN
    CREATE POLICY crm_lead_requests_admin_update 
      ON crm_lead_requests
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM crm_users 
          WHERE crm_users.auth_user_id = auth.uid() 
          AND crm_users.crm_role = 'ADMIN'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM crm_users 
          WHERE crm_users.auth_user_id = auth.uid() 
          AND crm_users.crm_role = 'ADMIN'
        )
      );
  END IF;
END $$;

-- Policy: Admins can delete requests (soft delete via admin only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'crm_lead_requests' 
    AND policyname = 'crm_lead_requests_admin_delete'
  ) THEN
    CREATE POLICY crm_lead_requests_admin_delete 
      ON crm_lead_requests
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM crm_users 
          WHERE crm_users.auth_user_id = auth.uid() 
          AND crm_users.crm_role = 'ADMIN'
        )
      );
  END IF;
END $$;
