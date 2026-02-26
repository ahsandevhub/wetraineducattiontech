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

  // In new schema, crm_users.id = auth.users.id directly
  // Verify user exists in crm_users
  const { data: crmUser } = await supabase
    .from("crm_users")
    .select("id")
    .eq("id", userId)
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

  const { data: logs, error } = await supabase
    .from("crm_contact_logs")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  // Enrich with profile data (crm_users.id = auth.users.id = profiles.id)
  const userIds = [
    ...new Set((logs || []).map((l) => l.user_id).filter(Boolean)),
  ];
  const { data: userProfiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)
    : { data: [] };
  const profileMap = new Map((userProfiles || []).map((p) => [p.id, p]));

  const data = (logs || []).map((log) => ({
    ...log,
    user: profileMap.get(log.user_id)
      ? {
          full_name: profileMap.get(log.user_id)!.full_name,
          email: profileMap.get(log.user_id)!.email,
        }
      : null,
  }));

  return { data };
}
