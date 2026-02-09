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
import { AlertCircle, CreditCard, Zap } from "lucide-react";
import Link from "next/link";
import type {
  CustomerPaymentRow,
  CustomerProfile,
  CustomerServiceRow,
  CustomerStats,
} from "./types";

type CustomerDashboardClientProps = {
  stats: CustomerStats;
  profile: CustomerProfile;
  lastPayments: CustomerPaymentRow[];
  activeServices: CustomerServiceRow[];
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

export default function CustomerDashboardClient({
  stats,
  profile,
  lastPayments,
  activeServices,
}: CustomerDashboardClientProps) {
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

      {/* Last 3 Payments Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Payments</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/customer/payments">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lastPayments.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lastPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.reference.substring(0, 12)}...
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.method}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`capitalize ${getStatusColor(payment.status)}`}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payments yet
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
