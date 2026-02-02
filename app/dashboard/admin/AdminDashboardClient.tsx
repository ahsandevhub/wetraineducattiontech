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
import { AlertCircle, Receipt, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";
import CopyButton from "./_components/CopyButton";
import { formatCurrency, getStatusColor } from "./_components/formatters";
import type {
  AdminCustomerRow,
  AdminOrderRow,
  AdminPaymentRow,
  AdminStats,
} from "./types";

type AdminDashboardClientProps = {
  customers: AdminCustomerRow[];
  payments: AdminPaymentRow[];
  orders: AdminOrderRow[];
  stats: AdminStats;
};

export default function AdminDashboardClient({
  customers,
  payments,
  orders,
  stats,
}: AdminDashboardClientProps) {
  const latestCustomers = customers.slice(0, 5);
  const latestPayments = payments.slice(0, 5);
  const latestOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">
            Overview of customers, payments, and orders.
          </p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800">Export Report</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={<Users className="h-5 w-5 text-gray-400" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<Receipt className="h-5 w-5 text-gray-400" />}
        />
        <StatCard
          title="Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={<ShoppingCart className="h-5 w-5 text-gray-400" />}
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments.toLocaleString()}
          icon={<AlertCircle className="h-5 w-5 text-gray-400" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          This overview shows your latest activity. Use the left menu to manage
          Customers, Payments, and Orders.
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Latest Customers</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/admin/customers">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Email
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-6 text-gray-500"
                      >
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    latestCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50">
                        <TableCell>
                          <CopyButton text={customer.id} />
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {customer.fullName}
                        </TableCell>
                        <TableCell>
                          <CopyButton
                            text={customer.email}
                            truncateLength={20}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Latest Payments</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/admin/payments">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900">
                      Payment ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestPayments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-gray-500"
                      >
                        No payments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    latestPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-gray-50">
                        <TableCell>
                          <CopyButton text={payment.id} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {payment.customerName}
                        </TableCell>
                        <TableCell>
                          <CopyButton
                            text={payment.customerEmail}
                            truncateLength={10}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Latest Orders</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/admin/orders">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900">
                      Order ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Email
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-6 text-gray-500"
                      >
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    latestOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50">
                        <TableCell>
                          <CopyButton text={order.id} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          {order.customerName}
                        </TableCell>
                        <TableCell>
                          <CopyButton
                            text={order.customerEmail}
                            truncateLength={10}
                          />
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );
}
