import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import CustomerDashboardClient from "./CustomerDashboardClient";
import type {
  CustomerPaymentRow,
  CustomerProfile,
  CustomerServiceRow,
  CustomerStats,
  Service,
} from "./types";

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
    .select(
      "id, full_name, email, phone, address, city, state, postal_code, country, role, created_at",
    )
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/dashboard/admin");
  }

  const [paymentsResult, ordersResult, servicesResult] = await Promise.all([
    supabase
      .from("payments")
      .select("id, amount, method, status, reference, service, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("id, package_name, amount, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const payments: CustomerPaymentRow[] = (paymentsResult.data ?? []).map(
    (row) => ({
      id: row.id as string,
      amount: Number(row.amount ?? 0),
      method: (row.method ?? "").toString(),
      status: (row.status ?? "pending").toString(),
      reference: (row.reference ?? "").toString(),
      service: row.service ?? null,
      createdAt: row.created_at ?? null,
    }),
  );

  const services: CustomerServiceRow[] = (ordersResult.data ?? []).map(
    (order) => ({
      id: order.id as string,
      packageName: order.package_name ?? "Service",
      amount: order.amount ?? 0,
      status: (order.status ?? "processing").toString(),
      createdAt: order.created_at,
    }),
  );

  const availableServices: Service[] = (servicesResult.data ?? []).map(
    (service) => ({
      id: service.id,
      title: service.title,
      slug: service.slug,
      category: service.category as "course" | "software" | "marketing",
      price: Number(service.price ?? 0),
      discount: service.discount ? Number(service.discount) : null,
      currency: service.currency ?? "BDT",
      details: service.details,
      key_features: service.key_features ?? [],
      featured_image_url: service.featured_image_url,
    }),
  );

  const totalSpent = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending",
  ).length;

  const stats: CustomerStats = {
    activeServices: services.filter((s) => s.status === "completed").length,
    totalSpent,
    pendingPayments,
  };

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

  // Get purchased package names
  const purchasedPackages = new Set(
    (ordersResult.data ?? [])
      .filter(
        (order) => order.status === "completed" || order.status === "pending",
      )
      .map((order) => order.package_name),
  );

  // Get last 3 payments for preview
  const lastPayments = payments.slice(0, 3);
  // Get active services preview (completed orders)
  const activeServicesPreview = services
    .filter((s) => s.status === "completed")
    .slice(0, 3);

  return (
    <CustomerDashboardClient
      stats={stats}
      profile={profileData}
      lastPayments={lastPayments}
      activeServices={activeServicesPreview}
      availableServices={availableServices}
      purchasedPackages={Array.from(purchasedPackages)}
    />
  );
}
