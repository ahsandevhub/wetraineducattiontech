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

  // Get the payment to find related order
  const { data: payment } = await supabase
    .from("payments")
    .select("user_id, amount, created_at")
    .eq("id", id)
    .single();

  // Update payment status
  const { error } = await supabase
    .from("payments")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  // Also update related order status
  if (payment?.user_id && payment?.amount) {
    const orderStatus =
      status === "paid"
        ? "completed"
        : status === "failed"
          ? "canceled"
          : "pending";

    // Find related order by matching user_id, amount, and created around the same time
    // This helps link payment to the correct order when multiple orders exist
    const paymentDate = new Date(payment.created_at);
    const timeWindow = new Date(paymentDate.getTime() - 5 * 60 * 1000); // 5 minutes before

    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: orderStatus })
      .eq("user_id", payment.user_id)
      .eq("amount", payment.amount)
      .gte("created_at", timeWindow.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (orderError) {
      console.error("Order status update error:", orderError);
    }
  }
}

export async function rejectPayment(id: string) {
  const supabase = await assertAdmin();

  // Get the payment to find related order
  const { data: payment } = await supabase
    .from("payments")
    .select("user_id, amount, created_at")
    .eq("id", id)
    .single();

  // Update payment status to failed
  const { error } = await supabase
    .from("payments")
    .update({ status: "failed" })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  // Also update related order status to canceled
  if (payment?.user_id && payment?.amount) {
    const paymentDate = new Date(payment.created_at);
    const timeWindow = new Date(paymentDate.getTime() - 5 * 60 * 1000); // 5 minutes before

    const { error: orderError } = await supabase
      .from("orders")
      .update({ status: "canceled" })
      .eq("user_id", payment.user_id)
      .eq("amount", payment.amount)
      .gte("created_at", timeWindow.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (orderError) {
      console.error("Order status update error:", orderError);
    }
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

export async function createProduct(data: {
  name: string;
  slug: string;
  code: string;
  category: string;
  price?: number | null;
  currency?: string;
}) {
  const supabase = await assertAdmin();

  const { error } = await supabase.from("products").insert({
    name: data.name,
    slug: data.slug,
    code: data.code,
    category: data.category,
    price: data.price ?? null,
    currency: data.currency ?? "BDT",
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    slug?: string;
    code?: string;
    category?: string;
    price?: number | null;
    currency?: string;
  },
) {
  const supabase = await assertAdmin();
  const updateData: Record<string, string | number | null | undefined> = {
    name: data.name,
    slug: data.slug,
    code: data.code,
    category: data.category,
    price: data.price,
    currency: data.currency,
  };

  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteProduct(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createService(data: {
  title: string;
  slug: string;
  category: string;
  price?: number | null;
  discount?: number | null;
  currency?: string;
  details?: string | null;
  keyFeatures?: string[];
  featuredImageUrl: string;
}) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("services").insert({
    title: data.title,
    slug: data.slug,
    category: data.category,
    price: data.price ?? null,
    discount: data.discount ?? null,
    currency: data.currency ?? "BDT",
    details: data.details ?? null,
    key_features: data.keyFeatures ?? [],
    featured_image_url: data.featuredImageUrl,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateService(
  id: string,
  data: {
    title?: string;
    slug?: string;
    category?: string;
    price?: number | null;
    discount?: number | null;
    currency?: string;
    details?: string | null;
    keyFeatures?: string[];
    featuredImageUrl?: string;
  },
) {
  const supabase = await assertAdmin();
  const updateData: Record<
    string,
    string | number | string[] | null | undefined
  > = {
    title: data.title,
    slug: data.slug,
    category: data.category,
    price: data.price,
    discount: data.discount,
    currency: data.currency,
    details: data.details,
    key_features: data.keyFeatures,
    featured_image_url: data.featuredImageUrl,
  };

  const { error } = await supabase
    .from("services")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteService(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createProject(data: {
  title: string;
  slug: string;
  category: string;
  description: string;
  techStack?: string[];
  featuredImageUrl: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
}) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("featured_projects").insert({
    title: data.title,
    slug: data.slug,
    category: data.category,
    description: data.description,
    tech_stack: data.techStack ?? [],
    featured_image_url: data.featuredImageUrl,
    live_url: data.liveUrl ?? null,
    github_url: data.githubUrl ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProject(
  id: string,
  data: {
    title?: string;
    slug?: string;
    category?: string;
    description?: string;
    techStack?: string[];
    featuredImageUrl?: string;
    liveUrl?: string | null;
    githubUrl?: string | null;
  },
) {
  const supabase = await assertAdmin();
  const updateData: Record<string, string | string[] | null | undefined> = {
    title: data.title,
    slug: data.slug,
    category: data.category,
    description: data.description,
    tech_stack: data.techStack,
    featured_image_url: data.featuredImageUrl,
    live_url: data.liveUrl,
    github_url: data.githubUrl,
  };

  const { error } = await supabase
    .from("featured_projects")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteProject(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("featured_projects")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createCertification(data: {
  title: string;
  issuer: string;
  issuedAt: string;
  description: string;
  credentialId?: string | null;
  verifyUrl?: string | null;
  imageUrl?: string | null;
}) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("certifications").insert({
    title: data.title,
    issuer: data.issuer,
    issued_at: data.issuedAt,
    description: data.description,
    credential_id: data.credentialId ?? null,
    verify_url: data.verifyUrl ?? null,
    image_url: data.imageUrl ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateCertification(
  id: string,
  data: {
    title?: string;
    issuer?: string;
    issuedAt?: string;
    description?: string;
    credentialId?: string | null;
    verifyUrl?: string | null;
    imageUrl?: string | null;
  },
) {
  const supabase = await assertAdmin();
  const updateData: Record<string, string | null | undefined> = {
    title: data.title,
    issuer: data.issuer,
    issued_at: data.issuedAt,
    description: data.description,
    credential_id: data.credentialId,
    verify_url: data.verifyUrl,
    image_url: data.imageUrl,
  };

  const { error } = await supabase
    .from("certifications")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteCertification(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("certifications").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createStory(data: {
  name: string;
  role: string;
  quote: string;
  achievement: string;
  rating: number;
  imageUrl?: string | null;
}) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("client_stories").insert({
    name: data.name,
    role: data.role,
    quote: data.quote,
    achievement: data.achievement,
    rating: data.rating,
    image_url: data.imageUrl ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateStory(
  id: string,
  data: {
    name?: string;
    role?: string;
    quote?: string;
    achievement?: string;
    rating?: number;
    imageUrl?: string | null;
  },
) {
  const supabase = await assertAdmin();
  const updateData: Record<string, string | number | null | undefined> = {
    name: data.name,
    role: data.role,
    quote: data.quote,
    achievement: data.achievement,
    rating: data.rating,
    image_url: data.imageUrl,
  };

  const { error } = await supabase
    .from("client_stories")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteStory(id: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("client_stories").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
