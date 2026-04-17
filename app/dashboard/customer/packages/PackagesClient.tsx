"use client";

import { getServicePricing } from "@/app/utils/services/pricing";
import ServiceCard from "@/components/shared/ServiceCard";
import { ShoppingCart } from "lucide-react";

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

interface PackagesClientProps {
  services: Service[];
  purchasedPackages: string[];
}

export default function PackagesClient({
  services,
  purchasedPackages,
}: PackagesClientProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "course":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "software":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "marketing":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const isPurchased = (title: string) => {
    return purchasedPackages.includes(title);
  };

  // Group services by category
  const groupedServices = services.reduce(
    (groups, service) => {
      const category = service.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(service);
      return groups;
    },
    {} as Record<"course" | "software" | "marketing", Service[]>,
  );

  const categoryOrder: Array<"course" | "software" | "marketing"> = [
    "course",
    "software",
    "marketing",
  ];
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "course":
        return "Courses";
      case "software":
        return "Software";
      case "marketing":
        return "Marketing Services";
      default:
        return category;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Packages</h1>
          <p className="text-gray-600 mt-2">
            Explore and purchase our services to enhance your skills
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ShoppingCart className="w-5 h-5" />
          <span>{services.length} packages available</span>
        </div>
      </div>

      {/* Category Sections */}
      {categoryOrder.map((category) => {
        const categoryServices = groupedServices[category] || [];
        if (categoryServices.length === 0) return null;

        return (
          <div key={category} className="space-y-4">
            <div className="border-b">
              <h2 className="text-2xl font-bold text-gray-900 pb-3">
                {getCategoryLabel(category)}
              </h2>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {categoryServices.map((service) => {
                const pricing = getServicePricing(
                  service.price,
                  service.discount,
                );
                const purchased = isPurchased(service.title);

                return (
                  <ServiceCard
                    key={service.id}
                    id={service.id}
                    title={service.title}
                    description={service.details}
                    features={service.key_features}
                    imageUrl={service.featured_image_url}
                    categoryLabel={
                      service.category.charAt(0).toUpperCase() +
                      service.category.slice(1)
                    }
                    categoryClassName={getCategoryColor(service.category)}
                    priceLabel={`৳${pricing.discountedPrice!.toLocaleString()}`}
                    originalPriceLabel={
                      pricing.hasDiscount
                        ? `৳${pricing.originalPrice!.toLocaleString()}`
                        : null
                    }
                    priceNote={
                      pricing.hasDiscount
                        ? `You save ৳${pricing.savingsAmount!.toLocaleString()} (${pricing.savingsPercent}% off)`
                        : null
                    }
                    ctaHref={purchased ? undefined : `/checkout?id=${service.id}`}
                    ctaLabel={purchased ? "Already Purchased" : "Purchase Now"}
                    ctaDisabled={purchased}
                    ctaVariant={purchased ? "outline" : "default"}
                    topRightBadge={
                      purchased ? (
                        <div className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                          Purchased
                        </div>
                      ) : null
                    }
                    className={purchased ? "border-green-300 bg-green-50/30" : undefined}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Empty State */}
      {services.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No packages available
          </h3>
          <p className="text-gray-600">
            Check back later for new packages and services
          </p>
        </div>
      )}
    </div>
  );
}
