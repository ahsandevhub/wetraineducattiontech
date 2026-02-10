"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Check, ShoppingCart, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleCheckout = (serviceId: string) => {
    router.push(`/checkout?id=${serviceId}`);
  };

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

  const calculateFinalPrice = (price: number, discount: number | null) => {
    if (!discount) return price;
    return price - discount;
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
          const finalPrice = calculateFinalPrice(
            service.price,
            service.discount,
          );
          const purchased = isPurchased(service.title);

          return (
            <Card
              key={service.id}
              className={`pt-0 flex flex-col ${purchased ? "border-green-300 bg-green-50/30" : ""}`}
            >
              <CardHeader className="p-0">
                <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                  <Image
                    src={service.featured_image_url}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                  {purchased && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Purchased
                    </div>
                  )}
                  {service.discount && service.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Save ৳{service.discount}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getCategoryColor(service.category)}>
                      {service.category.charAt(0).toUpperCase() +
                        service.category.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  {service.details && (
                    <CardDescription className="line-clamp-2">
                      {service.details}
                    </CardDescription>
                  )}
                </div>

                {/* Key Features */}
                {service.key_features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Key Features:
                    </p>
                    <ul className="space-y-1">
                      {service.key_features.slice(0, 3).map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-600 flex items-start gap-2"
                        >
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                      {service.key_features.length > 3 && (
                        <li className="text-sm text-gray-500 pl-6">
                          +{service.key_features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Pricing */}
                <div className="pt-4 border-t">
                  {service.discount && service.discount > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ৳{finalPrice.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          ৳{service.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 font-medium">
                        You save ৳{service.discount.toLocaleString()}!
                      </p>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      ৳{service.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="px-6 py-0">
                <Button
                  onClick={() => handleCheckout(service.id)}
                  disabled={purchased}
                  className="w-full"
                  variant={purchased ? "outline" : "default"}
                >
                  {purchased ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Already Purchased
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Purchase Now
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
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
