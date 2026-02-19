import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
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

  // Check SUPER_ADMIN role
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("hrm_role")
    .eq("profile_id", user.id)
    .single();

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { subjectUserId } = await params;

  try {
    // Get subject user info
    const { data: subject, error: subjectError } = await supabase
      .from("hrm_users")
      .select("id, full_name, email, hrm_role")
      .eq("id", subjectUserId)
      .single();

    if (subjectError) throw subjectError;

    // Get active criteria set
    const { data: activeSet, error: setError } = await supabase
      .from("hrm_subject_criteria_sets")
      .select(
        `
        id,
        active_from,
        active_to,
        created_at,
        updated_at
      `,
      )
      .eq("subject_user_id", subjectUserId)
      .is("active_to", null)
      .maybeSingle();

    if (setError) throw setError;

    let items: any[] = [];
    if (activeSet) {
      // Get criteria items
      const { data: criteriaItems, error: itemsError } = await supabase
        .from("hrm_subject_criteria_items")
        .select(
          `
          id,
          criteria_id,
          weight,
          scale_max,
          hrm_criteria (
            id,
            key,
            name,
            default_scale_max,
            description
          )
        `,
        )
        .eq("criteria_set_id", activeSet.id);

      if (itemsError) throw itemsError;
      items = criteriaItems || [];
    }

    return NextResponse.json({
      subject: {
        id: subject.id,
        fullName: subject.full_name,
        email: subject.email,
        hrmRole: subject.hrm_role,
      },
      activeSet: activeSet
        ? {
            id: activeSet.id,
            activeFrom: activeSet.active_from,
            activeTo: activeSet.active_to,
            items: items.map((item) => ({
              id: item.id,
              criteriaId: item.criteria_id,
              weight: item.weight,
              scaleMax: item.scale_max,
              criteria: {
                id: item.hrm_criteria.id,
                key: item.hrm_criteria.key,
                name: item.hrm_criteria.name,
                defaultScaleMax: item.hrm_criteria.default_scale_max,
                description: item.hrm_criteria.description,
              },
            })),
          }
        : null,
    });
  } catch (error: any) {
    console.error("Error fetching criteria set:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch criteria set" },
      { status: 500 },
    );
  }
}

export async function POST(
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

  // Check SUPER_ADMIN role
  const { data: hrmUser } = await supabase
    .from("hrm_users")
    .select("id, hrm_role")
    .eq("profile_id", user.id)
    .single();

  if (hrmUser?.hrm_role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { subjectUserId } = await params;
  const body = await request.json();
  const { items } = body as {
    items: Array<{ criteriaId: string; weight: number; scaleMax?: number }>;
  };

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "At least one criterion is required" },
      { status: 400 },
    );
  }

  // Validate weights sum to 100
  const totalWeight = items.reduce(
    (sum: number, item: any) => sum + (item.weight || 0),
    0,
  );
  if (totalWeight !== 100) {
    return NextResponse.json(
      { error: `Weights must sum to 100 (current: ${totalWeight})` },
      { status: 400 },
    );
  }

  // Validate each item
  for (const item of items) {
    if (!item.criteriaId || typeof item.weight !== "number") {
      return NextResponse.json(
        { error: "Each item must have criteriaId and weight" },
        { status: 400 },
      );
    }
    if (item.weight < 0 || item.weight > 100) {
      return NextResponse.json(
        { error: "Weight must be between 0 and 100" },
        { status: 400 },
      );
    }
    if (item.scaleMax && (item.scaleMax < 1 || item.scaleMax > 100)) {
      return NextResponse.json(
        { error: "ScaleMax must be between 1 and 100" },
        { status: 400 },
      );
    }
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    // Close current active set if exists
    await supabase
      .from("hrm_subject_criteria_sets")
      .update({ active_to: today })
      .eq("subject_user_id", subjectUserId)
      .is("active_to", null);

    // Create new criteria set
    const { data: newSet, error: setError } = await supabase
      .from("hrm_subject_criteria_sets")
      .insert({
        subject_user_id: subjectUserId,
        active_from: today,
        active_to: null,
        created_by_id: hrmUser.id,
      })
      .select()
      .single();

    if (setError) throw setError;

    // Create criteria items
    const itemsToInsert = items.map((item: any) => ({
      criteria_set_id: newSet.id,
      criteria_id: item.criteriaId,
      weight: item.weight,
      scale_max: item.scaleMax || 10,
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from("hrm_subject_criteria_items")
      .insert(itemsToInsert)
      .select();

    if (itemsError) throw itemsError;

    return NextResponse.json({
      setId: newSet.id,
      itemsCreated: createdItems?.length || 0,
    });
  } catch (error: any) {
    console.error("Error creating criteria set:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create criteria set" },
      { status: 500 },
    );
  }
}
