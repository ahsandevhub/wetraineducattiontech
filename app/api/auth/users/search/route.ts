import { createClient } from "@/app/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchQuery = request.nextUrl.searchParams.get("q") || "";

    if (!searchQuery.trim()) {
      return NextResponse.json([]);
    }

    const query = searchQuery.toLowerCase().trim();
    const supabaseAdmin = createAdminClient();
    const matchedUsers: Array<{
      id: string;
      email: string;
      authFullName: string;
    }> = [];

    let page = 1;
    const perPage = 200;

    while (matchedUsers.length < 10) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error("Auth user search error:", error);
        return NextResponse.json(
          { error: "Failed to search users" },
          { status: 500 },
        );
      }

      const users = data.users ?? [];

      if (users.length === 0) {
        break;
      }

      const pageMatches = users
        .map((user) => {
          const authFullName =
            (
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              ""
            )
              .toString()
              .trim();
          const email = (user.email ?? "").trim();

          return {
            id: user.id,
            email,
            authFullName,
            matches: `${email} ${authFullName}`.toLowerCase().includes(query),
          };
        })
        .filter((user) => user.matches)
        .map((user) => ({
          id: user.id,
          email: user.email,
          authFullName: user.authFullName,
        }));

      matchedUsers.push(...pageMatches);

      if (users.length < perPage) {
        break;
      }

      page += 1;
    }

    const uniqueMatches = Array.from(
      new Map(matchedUsers.map((user) => [user.id, user])).values(),
    ).slice(0, 10);

    if (uniqueMatches.length === 0) {
      return NextResponse.json([]);
    }

    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .in(
        "id",
        uniqueMatches.map((user) => user.id),
      );

    if (profileError) {
      console.error("Profile enrichment error:", profileError);
      return NextResponse.json(
        { error: "Failed to search users" },
        { status: 500 },
      );
    }

    const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
    const formatted = uniqueMatches.map((user) => {
      const profile = profileMap.get(user.id);
      return {
        id: user.id,
        fullName: profile?.full_name?.trim() || user.authFullName,
        email: profile?.email?.trim() || user.email,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
