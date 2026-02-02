"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import CopyButton from "../_components/CopyButton";
import { formatCurrency, getStatusColor } from "../_components/formatters";
import TablePagination from "../_components/TablePagination";
import type { AdminOrderRow } from "../types";

type OrdersClientProps = {
  orders: AdminOrderRow[];
  updateOrderStatus: (id: string, status: string) => Promise<void>;
};

export default function OrdersClient({
  orders,
  updateOrderStatus,
}: OrdersClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const orderStatusFilter = searchParams.get("orderStatus") ?? "";
  const orderPage = parseInt(searchParams.get("orderPage") ?? "1");
  const orderRowsPerPage = parseInt(
    searchParams.get("orderRowsPerPage") ?? "10",
  );

  const updateParams = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const filteredOrders = orderStatusFilter
    ? orders.filter(
        (order) =>
          order.status.toLowerCase() === orderStatusFilter.toLowerCase(),
      )
    : orders;

  const startIndex = (orderPage - 1) * orderRowsPerPage;
  const paginated = filteredOrders.slice(
    startIndex,
    startIndex + orderRowsPerPage,
  );
  const totalPages = Math.ceil(filteredOrders.length / orderRowsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600">Manage orders and status.</p>
        </div>
        <Button variant="outline">Export</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select
              value={orderStatusFilter || "all"}
              onValueChange={(value) =>
                updateParams({
                  orderStatus: value === "all" ? null : value,
                  orderPage: 1,
                })
              }
            >
              <SelectTrigger className="h-8 w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">
                    Order ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Customer Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Customer Email
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Package
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell>
                        <CopyButton text={order.id} />
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900">
                        {order.customerName}
                      </TableCell>
                      <TableCell>
                        <CopyButton
                          text={order.customerEmail}
                          truncateLength={20}
                        />
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {order.packageName}
                      </TableCell>
                      <TableCell className="text-gray-900 font-medium">
                        {formatCurrency(order.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {order.status === "processing" && (
                          <div className="flex gap-1">
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
                              variant="outline"
                              disabled={isPending}
                              onClick={() =>
                                startTransition(async () => {
                                  await updateOrderStatus(order.id, "canceled");
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
          </div>

          <TablePagination
            currentPage={orderPage}
            totalPages={totalPages}
            rowsPerPage={orderRowsPerPage}
            totalRows={filteredOrders.length}
            onPageChange={(page) => updateParams({ orderPage: page })}
            onRowsPerPageChange={(rows) =>
              updateParams({ orderRowsPerPage: rows, orderPage: 1 })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
