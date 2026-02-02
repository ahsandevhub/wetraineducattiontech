"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CopyButton from "../_components/CopyButton";
import TablePagination from "../_components/TablePagination";
import type { AdminCustomerRow } from "../types";

type CustomersClientProps = {
  customers: AdminCustomerRow[];
};

export default function CustomersClient({ customers }: CustomersClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const customerQuery = searchParams.get("customerQuery") ?? "";
  const customerPage = parseInt(searchParams.get("customerPage") ?? "1");
  const customerRowsPerPage = parseInt(
    searchParams.get("customerRowsPerPage") ?? "10",
  );
  const [searchValue, setSearchValue] = useState(customerQuery);

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
      customer.id.toLowerCase().includes(query)
    );
  });

  const startIndex = (customerPage - 1) * customerRowsPerPage;
  const paginated = filteredCustomers.slice(
    startIndex,
    startIndex + customerRowsPerPage,
  );
  const totalPages = Math.ceil(filteredCustomers.length / customerRowsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-600">Manage your customers list.</p>
        </div>
        <Button variant="outline">Export</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center justify-between gap-4">
              <h2>Customers</h2>
              <Input
                className="w-64"
                placeholder="Filter customers..."
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
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Customer
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Email
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Joined
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-500"
                    >
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-gray-50">
                      <TableCell>
                        <CopyButton text={customer.id} truncateLength={20} />
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {customer.fullName}
                      </TableCell>
                      <TableCell>
                        <CopyButton text={customer.email} truncateLength={20} />
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString()
                          : "—"}
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
    </div>
  );
}
