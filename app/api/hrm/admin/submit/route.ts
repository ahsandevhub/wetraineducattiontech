import { createClient } from "@/app/utils/supabase/server";
import {
  computeSubmissionTotal,
  validateSubmittedScores,
} from "@/lib/hrm/scoring";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check ADMIN role
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("id, hrm_role")
    .eq("profile_id", user.id)
    .single();

  if (!hrmUser || hrmUser.hrm_role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { weekKey, subjectUserId, comment, items } = body as {
    weekKey: string;
    subjectUserId: string;
    comment?: string;
    items: Array<{ criteriaId: string; scoreRaw: number }>;
  };

  // Validation
  if (!weekKey || !subjectUserId || !items || !Array.isArray(items)) {
    return NextResponse.json(
      { error: "weekKey, subjectUserId, and items are required" },
      { status: 400 },
    );
  }

  try {
    // Verify assignment exists and is active
    const { data: assignment } = await supabase
      .from("hrm_assignments")
      .select("id")
      .eq("marker_admin_id", hrmUser.id)
      .eq("subject_user_id", subjectUserId)
      .eq("is_active", true)
      .single();

    if (!assignment) {
      return NextResponse.json(
        { error: "No active assignment for this subject" },
        { status: 403 },
      );
    }

    // Get week
    const { data: week } = await supabase
      .from("hrm_weeks")
      .select("id, status")
      .eq("week_key", weekKey)
      .single();

    if (!week) {
      return NextResponse.json({ error: "Week not found" }, { status: 404 });
    }

    if (week.status === "LOCKED") {
      return NextResponse.json({ error: "Week is locked" }, { status: 403 });
    }

    // Get active criteria set for subject
    const { data: criteriaSet } = await supabase
      .from("hrm_subject_criteria_sets")
      .select(
        `
        id,
        hrm_subject_criteria_items(
          criteria_id,
          weight,
          scale_max
        )
      `,
      )
      .eq("subject_user_id", subjectUserId)
      .is("active_to", null)
      .single();

    if (!criteriaSet) {
      return NextResponse.json(
        { error: "Subject has no active criteria set" },
        { status: 400 },
      );
    }

    const criteriaItems = criteriaSet.hrm_subject_criteria_items.map(
      (item: any) => ({
        criteriaId: item.criteria_id,
        scaleMax: item.scale_max,
        weightagePercent: item.weight,
      }),
    );

    // Validate scores
    const validation = validateSubmittedScores(criteriaItems, items);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 },
      );
    }

    // Compute total score
    const totalScore = computeSubmissionTotal(criteriaItems, items);

    // Check if submission already exists
    const { data: existingSubmission } = await supabase
      .from("hrm_kpi_submissions")
      .select("id")
      .eq("week_id", week.id)
      .eq("marker_admin_id", hrmUser.id)
      .eq("subject_user_id", subjectUserId)
      .maybeSingle();

    let submissionId: string;

    if (existingSubmission) {
      // Update existing submission
      const { data: updated, error: updateError } = await supabase
        .from("hrm_kpi_submissions")
        .update({
          total_score: totalScore,
          comment: comment || null,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", existingSubmission.id)
        .select("id")
        .single();

      if (updateError) throw updateError;
      submissionId = updated.id;

      // Delete existing items
      await supabase
        .from("hrm_kpi_submission_items")
        .delete()
        .eq("submission_id", submissionId);
    } else {
      // Create new submission
      const { data: created, error: createError } = await supabase
        .from("hrm_kpi_submissions")
        .insert({
          week_id: week.id,
          marker_admin_id: hrmUser.id,
          subject_user_id: subjectUserId,
          total_score: totalScore,
          comment: comment || null,
          submitted_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (createError) throw createError;
      submissionId = created.id;
    }

    // Insert submission items
    const submissionItems = items.map((item) => ({
      submission_id: submissionId,
      criteria_id: item.criteriaId,
      score_raw: item.scoreRaw,
    }));

    const { error: itemsError } = await supabase
      .from("hrm_kpi_submission_items")
      .insert(submissionItems);

    if (itemsError) throw itemsError;

    return NextResponse.json({
      submissionId,
      totalScore,
      submittedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit marks";
    console.error("Error submitting marks:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
