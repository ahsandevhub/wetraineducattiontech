/**
 * Migration: Add HRM Notifications System
 * Purpose: Track notifications for admins and employees about pending tasks, missed markings, and monthly results
 */

-- Create notification type enum
CREATE TYPE hrm_notification_type AS ENUM (
  'ADMIN_PENDING_MARKING',
  'ADMIN_MISSED_MARKING',
  'MONTH_RESULT_READY'
);

-- Create hrm_notifications table
CREATE TABLE hrm_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type hrm_notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_hrm_notifications_user_id ON hrm_notifications(user_id);
CREATE INDEX idx_hrm_notifications_user_id_is_read ON hrm_notifications(user_id, is_read);
CREATE INDEX idx_hrm_notifications_created_at ON hrm_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE hrm_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON hrm_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON hrm_notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can insert notifications (will use service role)
CREATE POLICY "Service role can insert notifications"
  ON hrm_notifications
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE hrm_notifications IS 'HRM system notifications for admins and employees';
COMMENT ON COLUMN hrm_notifications.type IS 'Type of notification: ADMIN_PENDING_MARKING, ADMIN_MISSED_MARKING, MONTH_RESULT_READY';
COMMENT ON COLUMN hrm_notifications.user_id IS 'Auth user ID (profile_id from hrm_users)';
COMMENT ON COLUMN hrm_notifications.link IS 'Optional deep link to relevant page';
