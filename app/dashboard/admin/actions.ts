"use server";

import { createClient } from "@/app/utils/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Not authorized");
  }

  return supabase;
}

export async function updatePaymentStatus(id: string, status: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("payments")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function rejectPayment(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("payments")
    .update({ status: "failed" })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCustomer(id: string) {
  const supabase = await assertAdmin();

  // Delete customer profile (cascade will delete related orders and payments)
  const { error } = await supabase.from("profiles").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateCustomerProfile(
  id: string,
  data: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    avatarUrl?: string;
  },
) {
  const supabase = await assertAdmin();

  // Map camelCase to snake_case for database
  const updateData: Record<string, string | undefined> = {};
  if (data.fullName !== undefined) updateData.full_name = data.fullName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.postalCode !== undefined) updateData.postal_code = data.postalCode;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
