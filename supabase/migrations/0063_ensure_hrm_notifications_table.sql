-- Ensure HRM notifications schema exists (idempotent)
-- Fixes production failures where hrm_notifications is missing from schema cache/database

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'hrm_notification_type'
  ) THEN
    CREATE TYPE public.hrm_notification_type AS ENUM (
      'ADMIN_PENDING_MARKING',
      'ADMIN_MISSED_MARKING',
      'MONTH_RESULT_READY'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.hrm_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.hrm_notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hrm_notifications_user_id
  ON public.hrm_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_hrm_notifications_user_id_is_read
  ON public.hrm_notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_hrm_notifications_created_at
  ON public.hrm_notifications(created_at DESC);

ALTER TABLE public.hrm_notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'hrm_notifications'
      AND policyname = 'Users can view their own notifications'
  ) THEN
    CREATE POLICY "Users can view their own notifications"
      ON public.hrm_notifications
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'hrm_notifications'
      AND policyname = 'Users can update their own notifications'
  ) THEN
    CREATE POLICY "Users can update their own notifications"
      ON public.hrm_notifications
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'hrm_notifications'
      AND policyname = 'Service role can insert notifications'
  ) THEN
    CREATE POLICY "Service role can insert notifications"
      ON public.hrm_notifications
      FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

GRANT ALL ON public.hrm_notifications TO service_role;
GRANT SELECT, UPDATE ON public.hrm_notifications TO authenticated;
