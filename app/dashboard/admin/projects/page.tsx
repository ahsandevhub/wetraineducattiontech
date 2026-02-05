import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import type { AdminProjectRow } from "../types";
import ProjectsClient from "./ProjectsClient";

export default async function AdminProjectsPage() {
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
    .from("featured_projects")
    .select(
      "id, title, slug, category, description, tech_stack, featured_image_url, live_url, github_url, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const projects: AdminProjectRow[] = (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title ?? "",
    slug: row.slug ?? "",
    category: row.category ?? "",
    description: row.description ?? "",
    techStack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
    featuredImageUrl: row.featured_image_url ?? "",
    liveUrl: row.live_url ?? null,
    githubUrl: row.github_url ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }));

  return <ProjectsClient projects={projects} />;
}
