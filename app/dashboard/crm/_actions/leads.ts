"use server";

import type {
  CreateLeadData,
  UpdateLeadData,
} from "@/app/dashboard/crm/_types";
import { requireCrmAccess, requireCrmAdmin } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Normalize Bangladesh phone numbers
function normalizeBDPhone(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle international format (+880 or 880)
  if (cleaned.startsWith("880")) {
    cleaned = cleaned.slice(3);
  }

  // Must be 11 digits starting with 01
  if (cleaned.length === 11 && cleaned.startsWith("01")) {
    return cleaned;
  }

  return null;
}

export async function createLead(data: CreateLeadData) {
  await requireCrmAccess();
  const userWithRoles = await getCurrentUserWithRoles();

  if (!userWithRoles) {
    return { error: "Unauthorized" };
  }

  const { userId } = userWithRoles;

  const supabase = await createClient();

  // Normalize phone
  const normalizedPhone = normalizeBDPhone(data.phone);
  if (!normalizedPhone) {
    return { error: "Invalid phone number format" };
  }

  // Check for duplicates
  const { data: existing } = await supabase
    .from("crm_leads")
    .select("id")
    .eq("phone", normalizedPhone)
    .single();

  if (existing) {
    return { error: "Lead with this phone number already exists" };
  }

  // Get crm_user_id (in new schema, crm_users.id = auth.users.id)
  const { data: crmUser } = await supabase
    .from("crm_users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!crmUser) {
    return { error: "CRM user profile not found" };
  }

  const { data: lead, error } = await supabase
    .from("crm_leads")
    .insert({
      name: data.name,
      phone: normalizedPhone,
      email: data.email || null,
      company: data.company || null,
      status: data.status || "NEW",
      source: data.source || "WEBSITE",
      notes: data.notes || null,
      owner_id: data.owner_id ? data.owner_id : null,
      created_by: crmUser.id, // Track who created the lead
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/crm/leads");
  revalidatePath("/dashboard/crm");
  return { data: lead };
}

export async function updateLead(id: string, data: UpdateLeadData) {
  await requireCrmAccess();
  const userWithRoles = await getCurrentUserWithRoles();

  if (!userWithRoles) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  // Normalize phone if provided
  let normalizedPhone = data.phone;
  if (data.phone) {
    const normalized = normalizeBDPhone(data.phone);
    if (!normalized) {
      return { error: "Invalid phone number format" };
    }
    normalizedPhone = normalized;
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (normalizedPhone !== undefined) updateData.phone = normalizedPhone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.company !== undefined) updateData.company = data.company;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.source !== undefined) updateData.source = data.source;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.owner_id !== undefined) updateData.owner_id = data.owner_id;

  const { data: lead, error } = await supabase
    .from("crm_leads")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/crm/leads");
  revalidatePath(`/dashboard/crm/leads/${id}`);
  revalidatePath("/dashboard/crm");
  return { data: lead };
}

export async function deleteLead(id: string) {
  await requireCrmAdmin();

  const supabase = await createClient();

  const { error } = await supabase.from("crm_leads").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/crm/leads");
  revalidatePath("/dashboard/crm");
  return { success: true };
}

export async function reassignLead(leadId: string, newOwnerId: string) {
  await requireCrmAccess();
  const userWithRoles = await getCurrentUserWithRoles();

  if (!userWithRoles) {
    return { error: "Unauthorized" };
  }

  const { userId, crmRole } = userWithRoles;
  const isAdmin = crmRole === "ADMIN";

  if (!userId) {
    return { error: "CRM user not found" };
  }

  const supabase = await createClient();

  // Fetch the lead to check ownership
  const { data: lead, error: leadError } = await supabase
    .from("crm_leads")
    .select("owner_id")
    .eq("id", leadId)
    .single();

  if (leadError) {
    return { error: leadError.message };
  }

  if (!lead) {
    return { error: "Lead not found" };
  }

  // Permission check:
  // - ADMIN can reassign any lead
  // - MARKETER can only reassign leads they own
  if (!isAdmin && lead.owner_id !== userId) {
    return { error: "You can only reassign leads you own" };
  }

  // Update lead: set new owner and mark source as REASSIGNED
  const { error } = await supabase
    .from("crm_leads")
    .update({
      owner_id: newOwnerId || null,
      source: "REASSIGNED",
    })
    .eq("id", leadId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/crm/leads");
  revalidatePath(`/dashboard/crm/leads/${leadId}`);
  revalidatePath("/dashboard/crm");
  return { success: true };
}
