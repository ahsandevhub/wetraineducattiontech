import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import type { AdminProductRow } from "../types";
import ProductsClient from "./ProductsClient";

export default async function AdminProductsPage() {
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
    .from("products")
    .select(
      "id, name, slug, code, category, price, currency, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const products: AdminProductRow[] = (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name ?? "",
    slug: row.slug ?? "",
    code: row.code ?? "",
    category: row.category ?? "",
    price: row.price === null ? null : Number(row.price),
    currency: row.currency ?? "BDT",
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }));

  return <ProductsClient products={products} />;
}
