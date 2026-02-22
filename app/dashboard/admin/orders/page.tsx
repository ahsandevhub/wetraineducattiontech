import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import { updateOrderStatus } from "../actions";
import type { AdminOrderRow } from "../types";
import OrdersClient from "./OrdersClient";

export default async function AdminOrdersPage() {
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

  const ordersResult = await supabase
    .from("orders")
    .select(
      "id, package_name, amount, status, created_at, profile:profiles(full_name, email)",
    )
    .order("created_at", { ascending: false });

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

  return <OrdersClient orders={orders} updateOrderStatus={updateOrderStatus} />;
}
