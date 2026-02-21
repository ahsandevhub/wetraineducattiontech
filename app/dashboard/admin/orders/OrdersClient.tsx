"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { Filter, Loader2, MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import CopyButton from "../_components/CopyButton";
import { formatCurrency, getStatusColor } from "../_components/formatters";
import TablePagination from "../_components/TablePagination";
import type { AdminOrderRow } from "../types";
import { OrderExportModal } from "./OrderExportModal";
import { OrderViewDialog } from "./OrderViewDialog";

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
  const orderSearch = searchParams.get("orderSearch") ?? "";
  const orderPage = parseInt(searchParams.get("orderPage") ?? "1");
  const orderRowsPerPage = parseInt(
    searchParams.get("orderRowsPerPage") ?? "10",
  );

  const [searchValue, setSearchValue] = useState(orderSearch);
  const [viewingOrder, setViewingOrder] = useState<AdminOrderRow | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<{
    id: string;
    type: "completed" | "canceled";
  } | null>(null);

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
      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [searchParams, router],
  );

  useEffect(() => {
    setSearchValue(orderSearch);
  }, [orderSearch]);

  // Debounce search with 400ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue === orderSearch) return;
      updateParams({
        orderSearch: searchValue || null,
        orderPage: 1,
      });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchValue, orderSearch, updateParams]);

  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (
      orderStatusFilter &&
      order.status.toLowerCase() !== orderStatusFilter.toLowerCase()
    ) {
      return false;
    }

    // Search filter
    if (orderSearch) {
      const query = orderSearch.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query) ||
        order.packageName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const startIndex = (orderPage - 1) * orderRowsPerPage;
  const paginated = filteredOrders.slice(
    startIndex,
    startIndex + orderRowsPerPage,
  );
  const totalPages = Math.ceil(filteredOrders.length / orderRowsPerPage);

  const handleUpdateStatus = (id: string, status: "completed" | "canceled") => {
    setActionLoading({ id, type: status });
    startTransition(async () => {
      try {
        await updateOrderStatus(id, status);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update order status",
        );
      } finally {
        setActionLoading(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-600">Manage orders and status.</p>
        </div>
        <Button variant="outline" onClick={() => setExportModalOpen(true)}>
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by order ID, customer name, email or package..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="max-w-xs"
              />
            </div>

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
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-primary-100">
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
                    Actions
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
                    <TableRow key={order.id} className="hover:bg-primary-50">
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isPending}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setViewingOrder(order)}
                            >
                              View Details
                            </DropdownMenuItem>
                            {order.status === "processing" && (
                              <>
                                <DropdownMenuItem
                                  disabled={
                                    isPending ||
                                    (actionLoading?.id === order.id &&
                                      actionLoading.type === "completed")
                                  }
                                  onClick={() =>
                                    handleUpdateStatus(order.id, "completed")
                                  }
                                >
                                  {actionLoading?.id === order.id &&
                                  actionLoading.type === "completed" ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    "Mark as Completed"
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={
                                    isPending ||
                                    (actionLoading?.id === order.id &&
                                      actionLoading.type === "canceled")
                                  }
                                  onClick={() =>
                                    handleUpdateStatus(order.id, "canceled")
                                  }
                                  className="text-red-600"
                                >
                                  {actionLoading?.id === order.id &&
                                  actionLoading.type === "canceled" ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    "Cancel Order"
                                  )}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Order View Dialog */}
      <OrderViewDialog
        order={viewingOrder}
        open={!!viewingOrder}
        onOpenChange={(open) => !open && setViewingOrder(null)}
      />

      {/* Export Modal */}
      <OrderExportModal
        orders={filteredOrders}
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
      />
    </div>
  );
}
