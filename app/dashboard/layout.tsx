import DashboardShell from "@/app/dashboard/DashboardShell";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type Role = "customer" | "admin";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
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

  const role = (profile?.role as Role) ?? "customer";

  return <DashboardShell role={role}>{children}</DashboardShell>;
}
