"use server";

import { requireCrmAdmin } from "@/app/utils/auth/require";
import { createClient } from "@/app/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

interface ImportRow {
  name: string;
  phone: string;
  email?: string;
  company?: string;
}

interface ImportProgress {
  processed: number;
  total: number;
  success: number;
  skipped: number;
  failed: number;
  currentLead: string;
  errors: Array<{ row: number; name: string; reason: string }>;
}

const BATCH_SIZE = 50; // Process 50 leads at a time

export async function importLeadsBatch(
  rows: ImportRow[],
  startIndex: number = 0,
  marketerIds: string[] = [],
): Promise<{ data?: ImportProgress; error?: string; done: boolean }> {
  await requireCrmAdmin();

  const supabase = await createClient();

  // Use provided marketers or get all marketers
  let marketers: { id: string }[] = [];

  if (marketerIds.length > 0) {
    // Use provided marketer IDs (these should be CRM user IDs, not auth IDs)
    marketers = marketerIds.map((id) => ({ id }));
  } else {
    // If no marketers provided, leads will be un-assigned (owner_id = null)
    marketers = [];
  }

  // Create admin client for RLS bypass (safe because requireCrmAdmin already validated)
  const supabaseAdmin = createAdminClient();

  const endIndex = Math.min(startIndex + BATCH_SIZE, rows.length);
  const batch = rows.slice(startIndex, endIndex);

  const progress: ImportProgress = {
    processed: 0,
    total: rows.length,
    success: 0,
    skipped: 0,
    failed: 0,
    currentLead: "",
    errors: [],
  };

  let currentMarketerIndex = startIndex % (marketers.length || 1);

  for (let i = 0; i < batch.length; i++) {
    const row = batch[i];
    const rowNumber = startIndex + i + 1;

    try {
      progress.currentLead = row.name || "Unknown";

      // Validate required fields
      if (!row.name || !row.phone) {
        progress.failed++;
        progress.errors.push({
          row: rowNumber,
          name: row.name || "Unknown",
          reason: "Missing name or phone",
        });
        continue;
      }

      // Normalize phone
      const normalizedPhone = normalizeBDPhone(row.phone);
      if (!normalizedPhone) {
        progress.skipped++;
        progress.errors.push({
          row: rowNumber,
          name: row.name,
          reason: `Invalid/Non-BD phone: ${row.phone}`,
        });
        continue;
      }

      // Check for duplicates
      const { data: existing } = await supabase
        .from("crm_leads")
        .select("id")
        .eq("phone", normalizedPhone)
        .single();

      if (existing) {
        progress.skipped++;
        progress.errors.push({
          row: rowNumber,
          name: row.name,
          reason: "Duplicate phone number",
        });
        continue;
      }

      // Assign to marketer or leave un-assigned
      let assignedMarketerId = null;
      if (marketers.length > 0) {
        // Round-robin assignment
        const assignedMarketer = marketers[currentMarketerIndex];
        currentMarketerIndex = (currentMarketerIndex + 1) % marketers.length;
        assignedMarketerId = assignedMarketer.id;
      }

      // Insert lead using admin client to bypass RLS
      const { error } = await supabaseAdmin.from("crm_leads").insert({
        name: row.name.trim(),
        phone: normalizedPhone,
        email: row.email?.trim() || null,
        company: row.company?.trim() || null,
        status: "NEW",
        source: "ADMIN",
        owner_id: assignedMarketerId,
      });

      if (error) {
        progress.failed++;
        progress.errors.push({
          row: rowNumber,
          name: row.name,
          reason: error.message,
        });
      } else {
        progress.success++;
      }
    } catch (error) {
      progress.failed++;
      progress.errors.push({
        row: rowNumber,
        name: row.name || "Unknown",
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    }

    progress.processed = startIndex + i + 1;
  }

  const done = endIndex >= rows.length;

  if (done) {
    revalidatePath("/dashboard/crm/leads");
    revalidatePath("/dashboard/crm");
  }

  return { data: progress, done };
}
