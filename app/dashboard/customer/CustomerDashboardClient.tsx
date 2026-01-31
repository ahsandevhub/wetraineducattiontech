"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export type CustomerServiceRow = {
  id: string;
  name: string;
  status: "active" | "inactive";
};

export type CustomerPaymentRow = {
  id: string;
  plan: string;
  amount: number;
  date: string | null;
  status: string;
  method: string;
};

export type CustomerStats = {
  activeServices: number;
  totalSpent: number;
};

export type CustomerProfile = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string | null;
};

type CustomerDashboardClientProps = {
  profile: CustomerProfile;
  payments: CustomerPaymentRow[];
  services: CustomerServiceRow[];
  stats: CustomerStats;
};

const formatCurrency = (value: number) => `৳${value.toLocaleString()}`;

export default function CustomerDashboardClient({
  profile,
  payments,
  services,
  stats,
}: CustomerDashboardClientProps) {
  const search = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setActiveTab(search.get("tab") ?? "overview");
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Customer Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Track your services, payments, and profile.
          </p>
        </div>
        <Button variant="secondary">Upgrade Plan</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Services
            </CardTitle>
            <Zap className="h-4 w-4 text-[var(--primary-yellow)]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {stats.activeServices}
            </div>
            <p className="text-xs text-gray-500">Running services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Spent
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrency(stats.totalSpent)}
            </div>
            <p className="text-xs text-gray-500">All-time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Membership
            </CardTitle>
            <Badge>{profile.role}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Member since{" "}
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Quick Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Stay on top of your active services and recent payments. Use tabs
              to manage details.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>My Services</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No active services yet.
                </div>
              ) : (
                services.map((service) => (
                  <Card key={service.id} className="border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-base">
                        {service.name}
                      </CardTitle>
                      <Badge
                        variant={
                          service.status === "active" ? "default" : "secondary"
                        }
                      >
                        {service.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <Zap className="h-6 w-6 text-gray-500" />
                      <Button
                        size="sm"
                        variant={
                          service.status === "active" ? "default" : "secondary"
                        }
                      >
                        {service.status === "active" ? "Manage" : "Activate"}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500"
                      >
                        No payments recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.id}
                        </TableCell>
                        <TableCell>{payment.plan}</TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          {payment.date
                            ? new Date(payment.date).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "paid"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">
                  {profile.fullName || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Role</p>
                <Badge variant="secondary">{profile.role}</Badge>
              </div>
              <Button variant="secondary">Request Profile Update</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
