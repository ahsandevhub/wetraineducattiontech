import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import type { CustomerPaymentRow, CustomerProfile } from "../types";
import CustomerPaymentsClient from "./CustomerPaymentsClient";

export default async function CustomerPaymentsPage() {
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

  const { data: paymentsData } = await supabase
    .from("payments")
    .select("id, amount, method, status, reference, service, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const payments: CustomerPaymentRow[] = (paymentsData ?? []).map((row) => ({
    id: row.id as string,
    amount: Number(row.amount ?? 0),
    method: (row.method ?? "").toString(),
    status: (row.status ?? "pending").toString(),
    reference: (row.reference ?? "").toString(),
    service: (row.service ?? "").toString() || null,
    createdAt: row.created_at ?? null,
  }));

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

  return <CustomerPaymentsClient payments={payments} profile={profileData} />;
}
