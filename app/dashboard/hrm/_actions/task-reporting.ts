"use server";

import { getCurrentUserWithRoles } from "@/app/utils/auth/roles";
import { createClient } from "@/app/utils/supabase/server";
import {
  HRM_TASK_REPORT_CATEGORIES,
  type HrmTaskReportCategory,
} from "../_lib/task-reporting-shared";
import { revalidatePath } from "next/cache";

type ReportingActionState = {
  error?: string;
  success?: boolean;
};

type ReportingInput = {
  reportId?: string;
  category: string;
  taskTitle: string;
  proofUrl?: string;
  notes?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}

function normalizeOptionalText(value?: string) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function validateInput(input: ReportingInput) {
  const category = input.category.trim();
  const taskTitle = input.taskTitle.trim();
  const proofUrl = normalizeOptionalText(input.proofUrl);
  const notes = normalizeOptionalText(input.notes);

  if (!HRM_TASK_REPORT_CATEGORIES.includes(category as HrmTaskReportCategory)) {
    throw new Error("Please choose a valid category");
  }

  if (!taskTitle) {
    throw new Error("Task title is required");
  }

  if (proofUrl) {
    try {
      const parsed = new URL(proofUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Proof link must use http or https");
      }
    } catch {
      throw new Error("Proof must be a valid URL");
    }
  }

  return {
    category: category as HrmTaskReportCategory,
    task_title: taskTitle,
    proof_url: proofUrl,
    notes,
  };
}

async function getActionContext() {
  const roles = await getCurrentUserWithRoles();

  if (!roles?.hrmRole) {
    throw new Error("Unauthorized");
  }

  return roles;
}

function revalidateReportingPages() {
  revalidatePath("/dashboard/hrm/employee/reporting");
  revalidatePath("/dashboard/hrm/admin/reporting");
  revalidatePath("/dashboard/hrm/super/reporting");
}

export async function createTaskReport(
  input: ReportingInput,
): Promise<ReportingActionState> {
  try {
    const roles = await getActionContext();
    const payload = validateInput(input);
    const supabase = await createClient();

    const { error } = await supabase.from("hrm_task_reports").insert({
      author_user_id: roles.userId,
      ...payload,
    });

    if (error) {
      throw error;
    }

    revalidateReportingPages();
    return { success: true };
  } catch (error) {
    return {
      error: getErrorMessage(error, "Failed to create report"),
    };
  }
}

export async function updateTaskReport(
  input: ReportingInput,
): Promise<ReportingActionState> {
  try {
    const roles = await getActionContext();
    const payload = validateInput(input);
    const reportId = input.reportId?.trim();

    if (!reportId) {
      throw new Error("Report ID is required");
    }

    const supabase = await createClient();
    const { data: existing, error: existingError } = await supabase
      .from("hrm_task_reports")
      .select("id, author_user_id, reported_at")
      .eq("id", reportId)
      .single();

    if (existingError || !existing) {
      throw new Error("Report not found");
    }

    if (roles.hrmRole !== "SUPER_ADMIN" && existing.author_user_id !== roles.userId) {
      throw new Error("You can only edit your own reports");
    }

    const { error } = await supabase
      .from("hrm_task_reports")
      .update({
        ...payload,
        reported_at: existing.reported_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    if (error) {
      throw error;
    }

    revalidateReportingPages();
    return { success: true };
  } catch (error) {
    return {
      error: getErrorMessage(error, "Failed to update report"),
    };
  }
}

export async function deleteTaskReport(
  reportId: string,
): Promise<ReportingActionState> {
  try {
    const roles = await getActionContext();
    const supabase = await createClient();

    const { data: existing, error: existingError } = await supabase
      .from("hrm_task_reports")
      .select("id, author_user_id")
      .eq("id", reportId)
      .single();

    if (existingError || !existing) {
      throw new Error("Report not found");
    }

    if (roles.hrmRole !== "SUPER_ADMIN" && existing.author_user_id !== roles.userId) {
      throw new Error("You can only delete your own reports");
    }

    const { error } = await supabase
      .from("hrm_task_reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      throw error;
    }

    revalidateReportingPages();
    return { success: true };
  } catch (error) {
    return {
      error: getErrorMessage(error, "Failed to delete report"),
    };
  }
}
