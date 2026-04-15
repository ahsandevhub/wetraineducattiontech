-- Migration: Update HRM task report categories
-- Date: 2026-04-15
-- Purpose: Align hrm_task_reports category constraint with the current HRM reporting category list

ALTER TABLE public.hrm_task_reports
  DROP CONSTRAINT IF EXISTS hrm_task_reports_category_check;

ALTER TABLE public.hrm_task_reports
  ADD CONSTRAINT hrm_task_reports_category_check CHECK (
    category IN (
      'General Ticket Handling',
      'Create Discount/AP Code',
      'Create GA/BOGO Account',
      'Create Payout Ticket',
      'Checking Payment & Send Contract',
      'Checking Account Reset',
      'Checking Payout',
      'Update Withdraw Status',
      'Customer Handling',
      'Replied Customer',
      'Re-assigned Tickets',
      'Ticket Create',
      'Ticket Management',
      'HubSpot Help Desk',
      'Meta (Facebook/Instagram)',
      'Telegram Support',
      'Social Media Engagement',
      'Facebook Community Engagement',
      'Customer Query Handling',
      'Customer Issue Resolution',
      'Phone Call Support',
      'Follow-up',
      'Support',
      'Customer Communication',
      'Trading Support',
      'Payout & Account Checking',
      'KYC Check',
      'Review Check',
      'Internal Coordination',
      'Documentation',
      'Meeting',
      'Content Writing',
      'Script Writing',
      'Social Media Post',
      'Video Shoot',
      'Video Edit',
      'Store Management',
      'IT Task',
      'Process Documentation',
      'Training Materials',
      'Maintain Customer Relationship',
      'Other'
    )
  );
