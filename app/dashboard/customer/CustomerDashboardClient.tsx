"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  Check,
  CreditCard,
  ShoppingCart,
  Tag,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  CustomerProfile,
  CustomerServiceRow,
  CustomerStats,
  Service,
} from "./types";

type CustomerDashboardClientProps = {
  stats: CustomerStats;
  profile: CustomerProfile;
  activeServices: CustomerServiceRow[];
  availableServices: Service[];
  purchasedPackages: string[];
};

const formatCurrency = (value: number) => `৳${value.toLocaleString()}`;
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "active":
      return "bg-blue-100 text-blue-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
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

export default function CustomerDashboardClient({
  stats,
  profile,
  activeServices,
  availableServices,
  purchasedPackages,
}: CustomerDashboardClientProps) {
  const router = useRouter();

  const handleCheckout = (serviceId: string) => {
    router.push(`/checkout?id=${serviceId}`);
  };

  const isPurchased = (title: string) => {
    return purchasedPackages.includes(title);
  };

  const groupedServices = availableServices.reduce(
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
        <p className="text-sm text-gray-600">
          Welcome back, {profile.fullName}. Here&apos;s an overview of your
          account.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Services
            </CardTitle>
            <Zap className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.activeServices}
            </div>
            <p className="text-xs text-gray-500">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Spent
            </CardTitle>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalSpent)}
            </div>
            <p className="text-xs text-gray-500">All-time spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Payments
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.pendingPayments}
            </div>
            <p className="text-xs text-gray-500">Awaiting action</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Services Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Services</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/customer/services">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeServices.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {activeServices.map((service) => (
                <Card key={service.id}>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {service.packageName}
                        </p>
                        <Badge
                          className={`mt-2 capitalize ${getStatusColor(service.status)}`}
                        >
                          {service.status}
                        </Badge>
                      </div>
                      <Zap className="h-5 w-5 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No active services
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Packages Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Browse Packages</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/customer/packages">Browse All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {availableServices.length > 0 ? (
            <div className="space-y-6">
              {categoryOrder.map((category) => {
                const categoryServices = groupedServices[category] || [];
                if (categoryServices.length === 0) return null;

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getCategoryLabel(category)}
                      </h3>
                      <Badge className={getCategoryColor(category)}>
                        {categoryServices.length} available
                      </Badge>
                    </div>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
                      {categoryServices.slice(0, 5).map((service) => {
                        const finalPrice = calculateFinalPrice(
                          service.price,
                          service.discount,
                        );
                        const purchased = isPurchased(service.title);

                        return (
                          <Card
                            key={service.id}
                            className={`pt-0 flex flex-col ${purchased ? "border-green-300 bg-green-50/30" : ""}  hover:shadow-md transition-shadow`}
                          >
                            <CardHeader className="p-0">
                              <div className="relative w-full h-32 rounded-t-lg overflow-hidden">
                                <Image
                                  src={service.featured_image_url}
                                  alt={service.title}
                                  fill
                                  className="object-cover"
                                />
                                {purchased && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Purchased
                                  </div>
                                )}
                                {service.discount && service.discount > 0 && (
                                  <div className="absolute top-2 left-2 bg-yellow-500 text-gray-900 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    Save ৳{service.discount}
                                  </div>
                                )}
                              </div>
                            </CardHeader>

                            <CardContent className="flex-1 p-4 space-y-3">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <Badge
                                    className={getCategoryColor(
                                      service.category,
                                    )}
                                  >
                                    {service.category.charAt(0).toUpperCase() +
                                      service.category.slice(1)}
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-sm line-clamp-1">
                                  {service.title}
                                </h3>
                                {service.details && (
                                  <p className="text-xs text-gray-600 line-clamp-1">
                                    {service.details}
                                  </p>
                                )}
                              </div>

                              {/* Pricing */}
                              <div className="pt-2 border-t">
                                {service.discount && service.discount > 0 ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg font-bold text-gray-900">
                                        ৳{finalPrice.toLocaleString()}
                                      </span>
                                      <span className="text-sm text-gray-400 line-through">
                                        ৳{service.price.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-lg font-bold text-gray-900">
                                    ৳{service.price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </CardContent>

                            <div className="px-4">
                              <Button
                                onClick={() => handleCheckout(service.id)}
                                disabled={purchased}
                                className="w-full text-xs"
                                variant={purchased ? "outline" : "default"}
                                size="sm"
                              >
                                {purchased ? (
                                  <>
                                    <Check className="w-3 h-3 mr-1" />
                                    Purchased
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-3 h-3 mr-1" />
                                    Get Now
                                  </>
                                )}
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No packages available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
