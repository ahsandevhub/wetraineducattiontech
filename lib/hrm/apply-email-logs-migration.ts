import { createClient } from "@/app/utils/supabase/server";

export async function runEmailLogsMigration() {
  const supabase = await createClient();

  const sqlStatements = [
    // Create table
    `CREATE TABLE IF NOT EXISTS public.hrm_email_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      subject_user_id UUID NOT NULL REFERENCES public.hrm_users(id) ON DELETE CASCADE,
      recipient_email TEXT NOT NULL,
      month_id UUID NOT NULL REFERENCES public.hrm_months(id) ON DELETE CASCADE,
      email_type VARCHAR(50) NOT NULL DEFAULT 'MARKSHEET',
      subject_line TEXT NOT NULL,
      html_content TEXT NOT NULL,
      text_content TEXT,
      sent_by_admin_id UUID REFERENCES public.hrm_users(id) ON DELETE SET NULL,
      sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      delivery_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      delivery_error TEXT,
      opened_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_subject_user_id 
      ON public.hrm_email_logs(subject_user_id)`,

    `CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_month_id 
      ON public.hrm_email_logs(month_id)`,

    `CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_sent_at 
      ON public.hrm_email_logs(sent_at DESC)`,

    `CREATE INDEX IF NOT EXISTS idx_hrm_email_logs_email_type 
      ON public.hrm_email_logs(email_type)`,

    // Enable RLS
    `ALTER TABLE public.hrm_email_logs ENABLE ROW LEVEL SECURITY`,
  ];

  for (const sql of sqlStatements) {
    const { error } = await supabase.rpc("execute_sql", { sql });
    if (error) {
      console.error("Migration error:", error);
      return { success: false, error: error.message };
    }
  }

  // Add RLS policies
  const policies = [
    {
      name: "Allow users to view their own email logs",
      definition: `auth.uid() = (SELECT profile_id FROM public.hrm_users WHERE id = subject_user_id)
        OR (SELECT hrm_role FROM public.hrm_users WHERE profile_id = auth.uid()) = 'SUPER_ADMIN'`,
      for: "SELECT",
    },
    {
      name: "Allow SUPER_ADMIN to create email logs",
      definition: `(SELECT hrm_role FROM public.hrm_users WHERE profile_id = auth.uid()) = 'SUPER_ADMIN'`,
      for: "INSERT",
    },
    {
      name: "Allow SUPER_ADMIN to update email logs",
      definition: `(SELECT hrm_role FROM public.hrm_users WHERE profile_id = auth.uid()) = 'SUPER_ADMIN'`,
      for: "UPDATE",
    },
  ];

  for (const policy of policies) {
    const policySql = `CREATE POLICY "${policy.name}" ON public.hrm_email_logs
      FOR ${policy.for} USING (${policy.definition})`;

    const { error } = await supabase.rpc("execute_sql", { sql: policySql });
    if (error && !error.message.includes("already exists")) {
      console.warn("Policy creation warning:", error.message);
    }
  }

  // Grant permissions
  const grants = [
    `GRANT SELECT ON public.hrm_email_logs TO authenticated`,
    `GRANT INSERT, UPDATE ON public.hrm_email_logs TO service_role`,
    `GRANT ALL ON public.hrm_email_logs TO service_role`,
  ];

  for (const grant of grants) {
    const { error } = await supabase.rpc("execute_sql", { sql: grant });
    if (error) {
      console.warn("Grant warning:", error.message);
    }
  }

  return { success: true, message: "Email logs table created successfully" };
}
