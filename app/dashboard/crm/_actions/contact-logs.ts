"use server";

import type { CreateContactLogData } from "@/app/dashboard/crm/_types";
import { requireCrmAccess } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createContactLog(data: CreateContactLogData) {
  await requireCrmAccess();
  const userWithRoles = await getCurrentUserWithRoles();

  if (!userWithRoles) {
    return { error: "Unauthorized" };
  }

  const { userId } = userWithRoles;

  const supabase = await createClient();

  // Get crm_user_id from auth_user_id
  const { data: crmUser } = await supabase
    .from("crm_users")
    .select("id")
    .eq("auth_user_id", userId)
    .single();

  if (!crmUser) {
    return { error: "CRM user profile not found" };
  }

  const { data: log, error } = await supabase
    .from("crm_contact_logs")
    .insert({
      lead_id: data.lead_id,
      contact_type: data.contact_type,
      notes: data.notes,
      user_id: crmUser.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Update lead's last_contacted_at
  await supabase
    .from("crm_leads")
    .update({ last_contacted_at: new Date().toISOString() })
    .eq("id", data.lead_id);

  revalidatePath(`/dashboard/crm/leads/${data.lead_id}`);
  revalidatePath("/dashboard/crm/logs");
  return { data: log };
}

export async function getContactLogs(leadId: string) {
  await requireCrmAccess();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_contact_logs")
    .select(
      `
      *,
      user:crm_users!crm_contact_logs_user_id_fkey (
        full_name,
        email
      )
    `,
    )
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data };
}
