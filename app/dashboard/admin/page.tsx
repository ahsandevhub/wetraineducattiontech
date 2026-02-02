import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import type {
  AdminCustomerRow,
  AdminOrderRow,
  AdminPaymentRow,
  AdminStats,
} from "./types";

export default async function AdminDashboardPage() {
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

  const [customersResult, paymentsResult, ordersResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select(
        "id, amount, method, status, created_at, profile:profiles(full_name, email)",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select(
        "id, package_name, amount, status, created_at, profile:profiles(full_name, email)",
      )
      .order("created_at", { ascending: false }),
  ]);

  const customers: AdminCustomerRow[] = (customersResult.data ?? []).map(
    (row) => ({
      id: row.id as string,
      fullName: row.full_name ?? "—",
      email: row.email ?? "—",
      role: row.role ?? "customer",
      createdAt: row.created_at ?? null,
    }),
  );

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

  const orders: AdminOrderRow[] = (ordersResult.data ?? []).map((row) => {
    const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;
    return {
      id: row.id as string,
      packageName: row.package_name ?? "—",
      amount: Number(row.amount ?? 0),
      status: (row.status ?? "pending").toString(),
      createdAt: row.created_at ?? null,
      customerName: profile?.full_name ?? "—",
      customerEmail: profile?.email ?? "—",
    };
  });

  const totalRevenue = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending",
  ).length;

  const stats: AdminStats = {
    totalCustomers: customers.length,
    totalRevenue,
    totalOrders: orders.length,
    pendingPayments,
  };

  return (
    <AdminDashboardClient
      customers={customers}
      payments={payments}
      orders={orders}
      stats={stats}
    />
  );
}
