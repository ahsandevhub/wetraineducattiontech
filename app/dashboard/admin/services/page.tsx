import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import type { AdminServiceRow } from "../types";
import ServicesClient from "./ServicesClient";

export default async function AdminServicesPage() {
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
    .from("services")
    .select(
      "id, title, slug, category, price, discount, currency, details, key_features, featured_image_url, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const services: AdminServiceRow[] = (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title ?? "",
    slug: row.slug ?? "",
    category: row.category ?? "",
    price: row.price === null ? null : Number(row.price),
    discount: row.discount === null ? null : Number(row.discount),
    currency: row.currency ?? "BDT",
    details: row.details ?? null,
    keyFeatures: Array.isArray(row.key_features) ? row.key_features : [],
    featuredImageUrl: row.featured_image_url ?? "",
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }));

  return <ServicesClient services={services} />;
}
