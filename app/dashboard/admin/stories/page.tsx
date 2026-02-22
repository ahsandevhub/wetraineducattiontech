import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import type { AdminStoryRow } from "../types";
import StoriesClient from "./StoriesClient";

export default async function AdminStoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard/customer");
  }

  const { data } = await supabase
    .from("client_stories")
    .select(
      "id, name, role, quote, achievement, rating, image_url, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const stories: AdminStoryRow[] = (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name ?? "",
    role: row.role ?? "",
    quote: row.quote ?? "",
    achievement: row.achievement ?? "",
    rating: Number(row.rating ?? 5),
    imageUrl: row.image_url ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }));

  return <StoriesClient stories={stories} />;
}
