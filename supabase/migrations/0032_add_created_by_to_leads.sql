-- Migration: Add created_by column to crm_leads table
-- Purpose: Track who created each lead (marketer who submitted request vs admin who was assigned)
-- This enables "Created by Me" KPI separate from "Assigned to Me" (owner_id)

-- Add the new column
ALTER TABLE crm_leads
ADD COLUMN created_by UUID NULL REFERENCES crm_users(id) ON DELETE SET NULL;

-- Create index on created_by for efficient queries when computing metrics
CREATE INDEX idx_crm_leads_created_by ON crm_leads(created_by);

-- Create composite index for common filter pattern: created_by + created_at desc
CREATE INDEX idx_crm_leads_created_by_created_at 
  ON crm_leads(created_by, created_at DESC);

-- Create composite index for owner_id + created_at desc (for assigned leads query)
CREATE INDEX idx_crm_leads_owner_id_created_at 
  ON crm_leads(owner_id, created_at DESC);
