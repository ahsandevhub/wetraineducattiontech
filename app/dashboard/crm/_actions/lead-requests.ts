"use server";

import { getValidLeadStatus } from "@/app/dashboard/crm/_constants/lead-status";
import type {
  CreateLeadRequestData,
  LeadRequestWithRequester,
} from "@/app/dashboard/crm/_types";
import { requireCrmAccess, requireCrmAdmin } from "@/app/utils/auth/require";
import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Normalize Bangladesh phone numbers (same as in leads.ts)
function normalizeBDPhone(phone: string): string | null {
  if (!phone) return null;

  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.startsWith("880")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.length === 11 && cleaned.startsWith("01")) {
    return cleaned;
  }

  return null;
}

/**
 * Create a lead request (Marketer requests admin to add a lead)
 */
export async function createLeadRequest(data: CreateLeadRequestData) {
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

  // In new schema, crm_users.id = auth.users.id directly
  const { data: crmUser } = await supabase
    .from("crm_users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!crmUser) {
    return { error: "CRM user profile not found" };
  }

  // Create lead request
  const leadPayload = {
    name: data.name,
    phone: normalizedPhone,
    email: data.email || null,
    company: data.company || null,
    source: data.source,
    notes: data.notes || null,
    status: "NEW", // Default status for new leads
  };

  const { data: request, error } = await supabase
    .from("crm_lead_requests")
    .insert({
      requester_id: crmUser.id,
      lead_payload: leadPayload,
      status: "PENDING",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating lead request:", error);
    return { error: "Failed to create lead request" };
  }

  revalidatePath("/dashboard/crm/leads");
  revalidatePath("/dashboard/crm/admin/lead-requests");

  return { data: request };
}

/**
 * List lead requests (Admin only)
 */
export async function listLeadRequests(options?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  await requireCrmAdmin();

  const supabase = await createClient();

  let query = supabase.from("crm_lead_requests").select(
    `
      id,
      requester_id,
      lead_payload,
      status,
      admin_note,
      reviewed_by,
      reviewed_at,
      created_at,
      updated_at
    `,
    { count: "exact" },
  );

  // Filter by status
  if (options?.status && options.status !== "ALL") {
    query = query.eq("status", options.status);
  }

  // Search in lead_payload (name, phone, email, company)
  if (options?.search) {
    const searchTerm = options.search.toLowerCase();
    // This is a simplified search - in production, use full-text search
    // For now, we'll fetch all and filter in JS, or use Supabase full-text search
    const allData = await query;
    if (allData.error) {
      console.error("Error fetching lead requests:", allData.error);
      return { error: "Failed to fetch lead requests", data: [] };
    }

    const rawData = allData.data || [];
    // Enrich with profile info for name search
    const requesterIds = [
      ...new Set(rawData.map((r) => r.requester_id).filter(Boolean)),
    ];
    const profileMap = new Map<
      string,
      { full_name: string | null; email: string | null }
    >();
    if (requesterIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", requesterIds);
      (profs || []).forEach((p) => profileMap.set(p.id, p));
    }

    const filtered = rawData
      .filter((req) => {
        const payload = req.lead_payload;
        const profile = profileMap.get(req.requester_id);
        const name = (payload.name || "").toLowerCase();
        const phone = (payload.phone || "").toLowerCase();
        const email = (payload.email || "").toLowerCase();
        const company = (payload.company || "").toLowerCase();
        const requesterName = (profile?.full_name || "").toLowerCase();

        return (
          name.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          email.includes(searchTerm) ||
          company.includes(searchTerm) ||
          requesterName.includes(searchTerm)
        );
      })
      .map((req) => ({
        ...req,
        requester: {
          id: req.requester_id,
          ...profileMap.get(req.requester_id),
        },
      }));

    return { data: filtered as unknown as LeadRequestWithRequester[] };
  }

  // Order by newest first
  query = query.order("created_at", { ascending: false });

  // Pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(
      options.offset,
      (options.offset || 0) + (options.limit || 10) - 1,
    );
  }

  const { data: rawRows, error, count } = await query;

  if (error) {
    console.error("Error fetching lead requests:", error);
    return { error: "Failed to fetch lead requests", data: [] };
  }

  // Enrich with profile names
  const requesterIds = [
    ...new Set((rawRows || []).map((r) => r.requester_id).filter(Boolean)),
  ];
  const profileMap = new Map<
    string,
    { full_name: string | null; email: string | null }
  >();
  if (requesterIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", requesterIds);
    (profs || []).forEach((p) => profileMap.set(p.id, p));
  }

  const enriched = (rawRows || []).map((r) => ({
    ...r,
    requester: { id: r.requester_id, ...profileMap.get(r.requester_id) },
  }));

  return {
    data: enriched as unknown as LeadRequestWithRequester[],
    count: count || 0,
  };
}

/**
 * Review a lead request (Admin only)
 */
export async function reviewLeadRequest(options: {
  requestId: string;
  decision: "APPROVE" | "DECLINE";
  adminNote?: string;
}) {
  await requireCrmAdmin();
  const userWithRoles = await getCurrentUserWithRoles();

  if (!userWithRoles) {
    return { error: "Unauthorized" };
  }

  const { userId } = userWithRoles;
  const supabase = await createClient();

  // Get admin's crm_user_id (in new schema, crm_users.id = auth.users.id)
  const { data: adminUser } = await supabase
    .from("crm_users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!adminUser) {
    return { error: "Admin user profile not found" };
  }

  // Fetch the request
  const { data: request, error: fetchError } = await supabase
    .from("crm_lead_requests")
    .select("*")
    .eq("id", options.requestId)
    .single();

  if (fetchError || !request) {
    return { error: "Lead request not found" };
  }

  if (options.decision === "APPROVE") {
    // Create the lead
    const leadPayload = request.lead_payload;

    // Validate status - force 'NEW' if invalid
    const validatedStatus = getValidLeadStatus(leadPayload.status);

    const { data: newLead, error: leadError } = await supabase
      .from("crm_leads")
      .insert({
        name: leadPayload.name,
        phone: leadPayload.phone,
        email: leadPayload.email || null,
        company: leadPayload.company || null,
        status: validatedStatus,
        source: leadPayload.source,
        owner_id: request.requester_id, // Auto-assign to requester
        notes: leadPayload.notes || null,
      })
      .select()
      .single();

    if (leadError) {
      console.error("Error creating lead:", leadError);
      return { error: "Failed to create lead" };
    }

    // Update request status and save lead_id
    const { error: updateError } = await supabase
      .from("crm_lead_requests")
      .update({
        status: "APPROVED",
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        admin_note: options.adminNote || null,
        lead_id: newLead.id, // Save the created lead's ID
      })
      .eq("id", options.requestId);

    if (updateError) {
      console.error("Error updating request:", updateError);
      return { error: "Failed to approve request" };
    }

    revalidatePath("/dashboard/crm/admin/lead-requests");
    revalidatePath("/dashboard/crm/leads");

    return { data: { success: true, lead: newLead } };
  } else {
    // Decline the request
    const { error: updateError } = await supabase
      .from("crm_lead_requests")
      .update({
        status: "DECLINED",
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        admin_note: options.adminNote || null,
      })
      .eq("id", options.requestId);

    if (updateError) {
      console.error("Error updating request:", updateError);
      return { error: "Failed to decline request" };
    }

    revalidatePath("/dashboard/crm/admin/lead-requests");

    return { data: { success: true } };
  }
}

/**
 * Get a single lead request (Admin only)
 */
export async function getLeadRequest(requestId: string) {
  await requireCrmAdmin();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("crm_lead_requests")
    .select(
      `
      id,
      requester_id,
      lead_payload,
      status,
      admin_note,
      reviewed_by,
      reviewed_at,
      created_at,
      updated_at
    `,
    )
    .eq("id", requestId)
    .single();

  if (error) {
    console.error("Error fetching lead request:", error);
    return { error: "Lead request not found" };
  }

  // Enrich requester with profile info
  let requesterProfile: { full_name: string | null; email: string | null } = {
    full_name: null,
    email: null,
  };
  if (data?.requester_id) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", data.requester_id)
      .single();
    if (prof) requesterProfile = prof;
  }

  const result = {
    ...data,
    requester: { id: data.requester_id, ...requesterProfile },
  };

  return { data: result as unknown as LeadRequestWithRequester };
}

/**
 * Get lead requests for the current user (marketer's own requests)
 */
export async function getMyLeadRequests(options?: {
  status?: "PENDING" | "APPROVED" | "DECLINED";
  search?: string;
  limit?: number;
  offset?: number;
}) {
  await requireCrmAccess();
  const userWithRoles = await getCurrentUserWithRoles();

  if (!userWithRoles) {
    return { error: "Unauthorized", data: [] };
  }

  const { userId } = userWithRoles;
  const supabase = await createClient();

  // Get current user's crm_user_id (in new schema, crm_users.id = auth.users.id)
  const { data: crmUser } = await supabase
    .from("crm_users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!crmUser) {
    return { error: "User profile not found", data: [] };
  }

  // Fetch marketer's own requests
  let query = supabase
    .from("crm_lead_requests")
    .select(
      `
      id,
      requester_id,
      lead_id,
      lead_payload,
      status,
      admin_note,
      reviewed_by,
      reviewed_at,
      created_at,
      updated_at
    `,
      { count: "exact" },
    )
    .eq("requester_id", crmUser.id);

  // Filter by status
  if (options?.status) {
    query = query.eq("status", options.status);
  }

  // Order by newest first
  query = query.order("created_at", { ascending: false });

  // Pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(
      options.offset,
      (options.offset || 0) + (options.limit || 10) - 1,
    );
  }

  const { data: rawRows, error, count } = await query;

  if (error) {
    console.error("Error fetching marketer requests:", error);
    return { error: "Failed to fetch requests", data: [] };
  }

  // Enrich requester_id with profile (the marketer is the current user)
  let selfProfile: { full_name: string | null; email: string | null } = {
    full_name: null,
    email: null,
  };
  if (crmUser.id) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", crmUser.id)
      .single();
    if (prof) selfProfile = prof;
  }

  let results = (rawRows || []).map((r) => ({
    ...r,
    requester: { id: r.requester_id, ...selfProfile },
  })) as unknown as LeadRequestWithRequester[];

  // Client-side search if provided (search in payload)
  if (options?.search) {
    const searchTerm = options.search.toLowerCase();
    results = results.filter((req) => {
      const payload =
        typeof req.lead_payload === "string"
          ? JSON.parse(req.lead_payload)
          : req.lead_payload;
      const name = (payload?.name || "").toLowerCase();
      const phone = (payload?.phone || "").toLowerCase();
      const email = (payload?.email || "").toLowerCase();
      const company = (payload?.company || "").toLowerCase();

      return (
        name.includes(searchTerm) ||
        phone.includes(searchTerm) ||
        email.includes(searchTerm) ||
        company.includes(searchTerm)
      );
    });
  }

  return { data: results, count: count || 0 };
}
