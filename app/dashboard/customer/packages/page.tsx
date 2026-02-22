import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import PackagesClient from "./PackagesClient";

interface Service {
  id: string;
  title: string;
  slug: string;
  category: "course" | "software" | "marketing";
  price: number;
  discount: number | null;
  currency: string;
  details: string | null;
  key_features: string[];
  featured_image_url: string;
}

export default async function CustomerPackagesPage() {
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

  // Fetch all available services
  const { data: servicesData } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch user's purchased packages
  const { data: ordersData } = await supabase
    .from("orders")
    .select("package_name, status")
    .eq("user_id", user.id);

  const services: Service[] = (servicesData ?? []).map((service) => ({
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
  }));

  // Get purchased package names
  const purchasedPackages = new Set(
    (ordersData ?? [])
      .filter(
        (order) => order.status === "completed" || order.status === "pending",
      )
      .map((order) => order.package_name),
  );

  return (
    <PackagesClient
      services={services}
      purchasedPackages={Array.from(purchasedPackages)}
    />
  );
}
