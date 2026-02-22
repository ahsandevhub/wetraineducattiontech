import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import type { CustomerServiceRow } from "../types";
import CustomerServicesClient from "./CustomerServicesClient";

export default async function CustomerServicesPage() {
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

  if (profile?.role === "admin") {
    redirect("/dashboard/admin");
  }

  const { data: servicesData } = await supabase
    .from("orders")
    .select("id, package_name, amount, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const services: CustomerServiceRow[] = (servicesData ?? []).map((order) => ({
    id: order.id as string,
    packageName: order.package_name ?? "Service",
    amount: order.amount ?? 0,
    status: (order.status ?? "processing").toString(),
    createdAt: order.created_at,
  }));

  const totalValue = services.reduce((sum, s) => sum + s.amount, 0);
  const completedCount = services.filter(
    (s) => s.status === "completed",
  ).length;

  return (
    <CustomerServicesClient
      services={services}
      totalValue={totalValue}
      completedCount={completedCount}
    />
  );
}
