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
import { AlertCircle, Receipt, ShoppingCart, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export type AdminCustomerRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string | null;
};

export type AdminPaymentRow = {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string | null;
};

export type AdminOrderRow = {
  id: string;
  customerName: string;
  customerEmail: string;
  packageName: string;
  amount: number;
  status: string;
  createdAt: string | null;
};

export type AdminStats = {
  totalCustomers: number;
  totalRevenue: number;
  totalOrders: number;
  pendingPayments: number;
};

type AdminDashboardClientProps = {
  customers: AdminCustomerRow[];
  payments: AdminPaymentRow[];
  orders: AdminOrderRow[];
  stats: AdminStats;
  updatePaymentStatus: (id: string, status: string) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
};

const formatCurrency = (value: number) => `৳${value.toLocaleString()}`;

export default function AdminDashboardClient({
  customers,
  payments,
  orders,
  stats,
  updatePaymentStatus,
  updateOrderStatus,
}: AdminDashboardClientProps) {
  const search = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setActiveTab(search.get("tab") ?? "overview");
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Manage customers, payments, and orders.
          </p>
        </div>
        <Button variant="secondary" disabled={isPending}>
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<Receipt className="h-5 w-5" />}
        />
        <StatCard
          title="Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments.toLocaleString()}
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Use the tabs above to review customer activity, payments, and
              orders. All data is pulled from Supabase.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-gray-500"
                      >
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.id}
                        </TableCell>
                        <TableCell>{customer.fullName}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString()
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
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
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{payment.customerName}</span>
                            <span className="text-xs text-gray-500">
                              {payment.customerEmail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "paid"
                                ? "default"
                                : payment.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.status === "pending" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={isPending}
                              onClick={() =>
                                startTransition(async () => {
                                  await updatePaymentStatus(payment.id, "paid");
                                  router.refresh();
                                })
                              }
                            >
                              Mark Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-gray-500"
                      >
                        No orders available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{order.customerName}</span>
                            <span className="text-xs text-gray-500">
                              {order.customerEmail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{order.packageName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "processing"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.status === "processing" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                disabled={isPending}
                                onClick={() =>
                                  startTransition(async () => {
                                    await updateOrderStatus(
                                      order.id,
                                      "completed",
                                    );
                                    router.refresh();
                                  })
                                }
                              >
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={isPending}
                                onClick={() =>
                                  startTransition(async () => {
                                    await updateOrderStatus(
                                      order.id,
                                      "canceled",
                                    );
                                    router.refresh();
                                  })
                                }
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="text-gray-500">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );
}
