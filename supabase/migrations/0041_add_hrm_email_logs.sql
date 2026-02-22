-- Migration: Add HRM email logs table
-- Date: 2026-02-22
-- Description: Track sent marksheet emails to subjects with content and history

CREATE TABLE IF NOT EXISTS public.hrm_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_user_id UUID NOT NULL REFERENCES public.hrm_users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  month_id UUID NOT NULL REFERENCES public.hrm_months(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL DEFAULT 'MARKSHEET', -- MARKSHEET, NOTIFICATION, etc
  subject_line TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  sent_by_admin_id UUID REFERENCES public.hrm_users(id) ON DELETE SET NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  delivery_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, SENT, FAILED, BOUNCED
  delivery_error TEXT,
  opened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_subject_user_id 
  ON public.hrm_email_logs(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_month_id 
  ON public.hrm_email_logs(month_id);
CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_sent_at 
  ON public.hrm_email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_email_type 
  ON public.hrm_email_logs(email_type);

-- Enable Row-Level Security
ALTER TABLE public.hrm_email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to view their own emails
CREATE POLICY "Allow users to view their own email logs" ON public.hrm_email_logs
FOR SELECT USING (
  auth.uid() = (SELECT profile_id FROM public.hrm_users WHERE id = subject_user_id)
  OR (SELECT hrm_role FROM public.hrm_users WHERE profile_id = auth.uid()) = 'SUPER_ADMIN'
);

-- Allow admins to create email logs
CREATE POLICY "Allow SUPER_ADMIN to create email logs" ON public.hrm_email_logs
FOR INSERT WITH CHECK (
  (SELECT hrm_role FROM public.hrm_users WHERE profile_id = auth.uid()) = 'SUPER_ADMIN'
);

-- Allow admins to update email logs
CREATE POLICY "Allow SUPER_ADMIN to update email logs" ON public.hrm_email_logs
FOR UPDATE USING (
  (SELECT hrm_role FROM public.hrm_users WHERE profile_id = auth.uid()) = 'SUPER_ADMIN'
);

-- Grant permissions
GRANT SELECT ON public.hrm_email_logs TO authenticated;
GRANT INSERT, UPDATE ON public.hrm_email_logs TO service_role;
GRANT ALL ON public.hrm_email_logs TO service_role;

-- Add comment
COMMENT ON TABLE public.hrm_email_logs IS 'Tracks all marksheet and notification emails sent to HRM subjects with delivery status and content history';
