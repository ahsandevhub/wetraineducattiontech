"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import CopyButton from "../_components/CopyButton";
import TablePagination from "../_components/TablePagination";
import { deleteCustomer } from "../actions";
import type { AdminCustomerRow } from "../types";
import { CustomerEditDialog } from "./CustomerEditDialog";
import { CustomerExportModal } from "./CustomerExportModal";

type CustomersClientProps = {
  customers: AdminCustomerRow[];
};

export default function CustomersClient({ customers }: CustomersClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const customerQuery = searchParams.get("customerQuery") ?? "";
  const customerPage = parseInt(searchParams.get("customerPage") ?? "1");
  const customerRowsPerPage = parseInt(
    searchParams.get("customerRowsPerPage") ?? "10",
  );
  const [searchValue, setSearchValue] = useState(customerQuery);
  const [editingCustomer, setEditingCustomer] =
    useState<AdminCustomerRow | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    customerId: string;
    customerName: string;
  } | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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

  useEffect(() => {
    setSearchValue(customerQuery);
  }, [customerQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue === customerQuery) return;
      updateParams({
        customerQuery: searchValue || null,
        customerPage: 1,
      });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchValue, customerQuery, updateParams]);

  const filteredCustomers = customers.filter((customer) => {
    const query = customerQuery.toLowerCase();
    return (
      customer.fullName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      (customer.phone && customer.phone.toLowerCase().includes(query)) ||
      customer.id.toLowerCase().includes(query)
    );
  });

  const startIndex = (customerPage - 1) * customerRowsPerPage;
  const paginated = filteredCustomers.slice(
    startIndex,
    startIndex + customerRowsPerPage,
  );
  const totalPages = Math.ceil(filteredCustomers.length / customerRowsPerPage);

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    setDeleteConfirm({ customerId, customerName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    startTransition(async () => {
      try {
        await deleteCustomer(deleteConfirm.customerId);
        toast.success("Customer deleted successfully");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete customer",
        );
      } finally {
        setDeleteConfirm(null);
      }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-600">Manage your customers list.</p>
        </div>
        <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between gap-4">
              <h2>Customers</h2>
              <Input
                className="w-64"
                placeholder="Search by name, email or phone..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">
                    Customer
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Phone
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Address
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Joined
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
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={customer.avatarUrl ?? undefined}
                              alt={customer.fullName}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-900 text-xs">
                              {getInitials(customer.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {customer.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CopyButton text={customer.email} truncateLength={20} />
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {customer.phone ? (
                          <CopyButton
                            text={customer.phone || "—"}
                            truncateLength={20}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {customer.address ? (
                          <div>
                            <p>{customer.address}</p>
                            {customer.city && (
                              <p className="text-xs text-gray-500">
                                {customer.city}
                                {customer.state && `, ${customer.state}`}
                              </p>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString()
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
                              onClick={() => setEditingCustomer(customer)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteCustomer(
                                  customer.id,
                                  customer.fullName,
                                )
                              }
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
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
            currentPage={customerPage}
            totalPages={totalPages}
            rowsPerPage={customerRowsPerPage}
            totalRows={filteredCustomers.length}
            onPageChange={(page) => updateParams({ customerPage: page })}
            onRowsPerPageChange={(rows) =>
              updateParams({ customerRowsPerPage: rows, customerPage: 1 })
            }
          />
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      {editingCustomer && (
        <CustomerEditDialog
          customer={editingCustomer}
          open={!!editingCustomer}
          onOpenChange={(open) => !open && setEditingCustomer(null)}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Customer"
        description={`Are you sure you want to delete ${deleteConfirm?.customerName}? This action cannot be undone and will also delete all related orders and payments.`}
        confirmText="Delete"
        confirmVariant="destructive"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        isLoading={isPending}
      />

      {/* Customer Export Modal */}
      <CustomerExportModal
        customers={customers}
        open={isExportModalOpen}
        onOpenChange={setIsExportModalOpen}
      />
    </div>
  );
}
