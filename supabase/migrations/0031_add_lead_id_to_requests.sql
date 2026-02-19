-- Add lead_id column to crm_lead_requests to link approved requests to created leads
-- This allows marketers to click from their request to the created lead detail page

ALTER TABLE crm_lead_requests ADD COLUMN lead_id uuid NULL REFERENCES crm_leads(id) ON DELETE SET NULL;

-- Create index for faster lookups by lead_id
CREATE INDEX idx_crm_lead_requests_lead_id ON crm_lead_requests(lead_id);
