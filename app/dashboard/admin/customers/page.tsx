import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import type { AdminCustomerRow } from "../types";
import CustomersClient from "./CustomersClient";

export default async function AdminCustomersPage() {
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

  const customersResult = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  const customers: AdminCustomerRow[] = (customersResult.data ?? []).map(
    (row) => ({
      id: row.id as string,
      fullName: row.full_name ?? "—",
      email: row.email ?? "—",
      role: row.role ?? "customer",
      createdAt: row.created_at ?? null,
    }),
  );

  return <CustomersClient customers={customers} />;
}
