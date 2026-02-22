import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import type { AdminCertificationRow } from "../types";
import CertificationsClient from "./CertificationsClient";

export default async function AdminCertificationsPage() {
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
    .from("certifications")
    .select(
      "id, title, issuer, issued_at, description, credential_id, verify_url, image_url, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const certifications: AdminCertificationRow[] = (data ?? []).map((row) => ({
    id: row.id as string,
    title: row.title ?? "",
    issuer: row.issuer ?? "",
    issuedAt: row.issued_at ?? "",
    description: row.description ?? "",
    credentialId: row.credential_id ?? null,
    verifyUrl: row.verify_url ?? null,
    imageUrl: row.image_url ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }));

  return <CertificationsClient certifications={certifications} />;
}
