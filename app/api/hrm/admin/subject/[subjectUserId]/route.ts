import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectUserId: string }> },
) {
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
    .eq("id", user.id)
    .single();

  if (!hrmUser || hrmUser.hrm_role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { subjectUserId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const weekKey = searchParams.get("weekKey");

  if (!weekKey) {
    return NextResponse.json({ error: "weekKey is required" }, { status: 400 });
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

    // Get subject's HRM role
    const { data: subjectHrm, error: subjectError } = await supabase
      .from("hrm_users")
      .select("id, hrm_role")
      .eq("id", subjectUserId)
      .single();

    if (subjectError) throw subjectError;

    // Get subject's profile (name/email)
    const { data: subjectProfile } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", subjectUserId)
      .maybeSingle();

    const subject = {
      id: subjectHrm.id,
      hrm_role: subjectHrm.hrm_role,
      full_name: subjectProfile?.full_name || null,
      email: subjectProfile?.email || null,
    };

    // Get active criteria set
    const { data: criteriaSet } = await supabase
      .from("hrm_subject_criteria_sets")
      .select(
        `
        id,
        active_from,
        hrm_subject_criteria_items(
          id,
          criteria_id,
          weight,
          scale_max,
          hrm_criteria(
            id,
            key,
            name,
            description
          )
        )
      `,
      )
      .eq("subject_user_id", subjectUserId)
      .is("active_to", null)
      .single();

    if (!criteriaSet) {
      return NextResponse.json({
        subject: {
          id: subject.id,
          fullName: subject.full_name,
          email: subject.email,
          hrmRole: subject.hrm_role,
        },
        criteriaSet: null,
        existingSubmission: null,
      });
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

    // Get existing submission if any
    const { data: submission } = await supabase
      .from("hrm_kpi_submissions")
      .select(
        `
        id,
        total_score,
        comment,
        submitted_at,
        hrm_kpi_submission_items(
          id,
          criteria_id,
          score_raw
        )
      `,
      )
      .eq("week_id", week.id)
      .eq("marker_admin_id", hrmUser.id)
      .eq("subject_user_id", subjectUserId)
      .maybeSingle();

    return NextResponse.json({
      subject: {
        id: subject.id,
        fullName: subject.full_name,
        email: subject.email,
        hrmRole: subject.hrm_role,
      },
      criteriaSet: {
        id: criteriaSet.id,
        activeFrom: criteriaSet.active_from,
        items: criteriaSet.hrm_subject_criteria_items.map((item: any) => ({
          id: item.id,
          criteriaId: item.criteria_id,
          weight: item.weight,
          scaleMax: item.scale_max,
          criteria: {
            id: item.hrm_criteria.id,
            key: item.hrm_criteria.key,
            name: item.hrm_criteria.name,
            description: item.hrm_criteria.description,
          },
        })),
      },
      existingSubmission: submission
        ? {
            id: submission.id,
            totalScore: submission.total_score,
            comment: submission.comment,
            submittedAt: submission.submitted_at,
            items: submission.hrm_kpi_submission_items.map((item: any) => ({
              criteriaId: item.criteria_id,
              scoreRaw: item.score_raw,
            })),
          }
        : null,
      weekStatus: week.status,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch subject data";
    console.error("Error fetching subject data:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
