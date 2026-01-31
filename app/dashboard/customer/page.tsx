import CustomerDashboardClient, {
  type CustomerPaymentRow,
  type CustomerProfile,
  type CustomerServiceRow,
  type CustomerStats,
} from "@/app/dashboard/customer/CustomerDashboardClient";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function CustomerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/dashboard/admin");
  }

  const [paymentsResult, ordersResult] = await Promise.all([
    supabase
      .from("payments")
      .select("id, amount, method, status, reference, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, package_name, amount, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const payments: CustomerPaymentRow[] = (paymentsResult.data ?? []).map(
    (row) => ({
      id: row.id as string,
      plan: row.reference ?? "Payment",
      amount: Number(row.amount ?? 0),
      status: (row.status ?? "pending").toString(),
      date: row.created_at ?? null,
      method: (row.method ?? "").toString(),
    }),
  );

  const servicesMap = new Map<string, CustomerServiceRow>();
  (ordersResult.data ?? []).forEach((order) => {
    const name = order.package_name ?? "Service";
    const status = (order.status ?? "pending").toString();
    const existing = servicesMap.get(name);
    if (!existing || status === "completed") {
      servicesMap.set(name, {
        id: order.id as string,
        name,
        status: status === "completed" ? "active" : "inactive",
      });
    }
  });

  const services = Array.from(servicesMap.values());
  const totalSpent = payments.reduce((sum, item) => sum + item.amount, 0);
  const stats: CustomerStats = {
    activeServices: services.filter((s) => s.status === "active").length,
    totalSpent,
  };

  const profileData: CustomerProfile = {
    id: profile?.id ?? user.id,
    fullName: profile?.full_name ?? "",
    email: profile?.email ?? user.email ?? "",
    role: (profile?.role ?? "customer").toString(),
    createdAt: profile?.created_at ?? null,
  };

  return (
    <CustomerDashboardClient
      profile={profileData}
      payments={payments}
      services={services}
      stats={stats}
    />
  );
}
