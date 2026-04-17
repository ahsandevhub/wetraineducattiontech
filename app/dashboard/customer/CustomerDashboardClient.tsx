"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServicePricing } from "@/app/utils/services/pricing";
import ServiceCard from "@/components/shared/ServiceCard";
import {
  AlertCircle,
  CreditCard,
  Zap,
} from "lucide-react";
import Link from "next/link";
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

export default function CustomerDashboardClient({
  stats,
  profile,
  activeServices,
  availableServices,
  purchasedPackages,
}: CustomerDashboardClientProps) {
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
                                ? `Save ৳${pricing.savingsAmount} • ${pricing.savingsPercent}% off`
                                : null
                            }
                            ctaHref={purchased ? undefined : `/checkout?id=${service.id}`}
                            ctaLabel={purchased ? "Purchased" : "Get Now"}
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
