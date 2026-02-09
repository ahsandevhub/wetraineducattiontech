import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import type { CustomerProfile } from "../types";
import CustomerProfileClient from "./CustomerProfileClient";

export default async function CustomerProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, address, city, state, postal_code, country, role, created_at",
    )
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/dashboard/admin");
  }

  const profileData: CustomerProfile = {
    id: profile?.id ?? user.id,
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? user.email ?? "",
    phone: profile?.phone ?? null,
    address: profile?.address ?? null,
    city: profile?.city ?? null,
    state: profile?.state ?? null,
    postalCode: profile?.postal_code ?? null,
    country: profile?.country ?? "Bangladesh",
    role: (profile?.role ?? "customer").toString(),
    createdAt: profile?.created_at ?? null,
  };

  return <CustomerProfileClient profile={profileData} />;
}
