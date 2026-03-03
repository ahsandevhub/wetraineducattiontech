"use server";

import type {
  CreateLeadData,
  UpdateLeadData,
} from "@/app/dashboard/crm/_types";
import { requireCrmAccess, requireCrmAdmin } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Normalize phone numbers with flexible validation
function normalizePhone(phone: string): string | null {
  if (!phone) return null;

  let cleaned = phone.trim().replace(/\D/g, "");

  // Normalize Bangladesh international format to local mobile format
  // e.g. +8801700000000 -> 01700000000
  if (cleaned.startsWith("8801") && cleaned.length === 13) {
    cleaned = cleaned.slice(2);
  }

  // Accept flexible international/local numbers
  // E.164 max length is 15 digits
  if (cleaned.length >= 7 && cleaned.length <= 15) {
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

  const { userId, crmRole } = userWithRoles;
  const isAdmin = crmRole === "ADMIN";
  const supabaseAdmin = createAdminClient();

  // Normalize phone
  const normalizedPhone = normalizePhone(data.phone);
  if (!normalizedPhone) {
    return { error: "Invalid phone number" };
  }

  // Check for duplicates
  const { data: existing } = await supabaseAdmin
    .from("crm_leads")
    .select("id")
    .eq("phone", normalizedPhone)
    .maybeSingle();

  if (existing) {
    return { error: "Lead with this phone number already exists" };
  }

  const ownerId = isAdmin ? (data.owner_id ? data.owner_id : null) : userId;

  const { data: lead, error } = await supabaseAdmin
    .from("crm_leads")
    .insert({
      name: data.name,
      phone: normalizedPhone,
      email: data.email || null,
      company: data.company || null,
      status: data.status || "NEW",
      source: data.source || "WEBSITE",
      notes: data.notes || null,
      owner_id: ownerId,
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

  const { userId, crmRole } = userWithRoles;
  const isAdmin = crmRole === "ADMIN";
  const supabaseAdmin = createAdminClient();

  const { data: existingLead, error: existingLeadError } = await supabaseAdmin
    .from("crm_leads")
    .select("id, owner_id")
    .eq("id", id)
    .single();

  if (existingLeadError || !existingLead) {
    return { error: "Lead not found" };
  }

  if (!isAdmin && existingLead.owner_id !== userId) {
    return { error: "You can only update leads you own" };
  }

  if (!isAdmin && data.owner_id !== undefined) {
    return { error: "Only admin can change lead assignment" };
  }

  // Normalize phone if provided
  let normalizedPhone = data.phone;
  if (data.phone) {
    const normalized = normalizePhone(data.phone);
    if (!normalized) {
      return { error: "Invalid phone number" };
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

  const { data: lead, error } = await supabaseAdmin
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
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.from("crm_leads").delete().eq("id", id);

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
  const supabaseAdmin = createAdminClient();

  // Fetch the lead to check ownership
  const { data: lead, error: leadError } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
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
