import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { updatePaymentStatus } from "../actions";
import type { AdminPaymentRow } from "../types";
import PaymentsClient from "./PaymentsClient";

export default async function AdminPaymentsPage() {
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

  // Fetch payments
  const paymentsResult = await supabase
    .from("payments")
    .select(
      "id, amount, method, status, created_at, profile:profiles(full_name, email)",
    )
    .order("created_at", { ascending: false });

  const payments: AdminPaymentRow[] = (paymentsResult.data ?? []).map((row) => {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
    return {
      id: row.id as string,
      amount: Number(row.amount ?? 0),
      method: (row.method ?? "").toString(),
      status: (row.status ?? "pending").toString(),
      createdAt: row.created_at ?? null,
      customerName: profile?.full_name ?? "—",
      customerEmail: profile?.email ?? "—",
    };
  });

  // Fetch customers for the add payment dialog
  const customersResult = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "customer")
    .order("full_name");

  const customers = (customersResult.data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name ?? "Unknown",
    email: row.email ?? "",
  }));

  return (
    <PaymentsClient
      payments={payments}
      customers={customers}
      updatePaymentStatus={updatePaymentStatus}
    />
  );
}
