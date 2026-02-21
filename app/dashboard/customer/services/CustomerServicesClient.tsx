"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Filter, Package } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import CopyButton from "../../admin/_components/CopyButton";
import {
  formatCurrency,
  getStatusColor,
} from "../../admin/_components/formatters";
import TablePagination from "../../admin/_components/TablePagination";
import type { CustomerServiceRow } from "../types";

type CustomerServicesClientProps = {
  services: CustomerServiceRow[];
  totalValue: number;
  completedCount: number;
};

export default function CustomerServicesClient({
  services,
  totalValue,
  completedCount,
}: CustomerServicesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const serviceStatusFilter = searchParams.get("serviceStatus") ?? "";
  const serviceSearch = searchParams.get("serviceSearch") ?? "";
  const servicePage = parseInt(searchParams.get("servicePage") ?? "1");
  const serviceRowsPerPage = parseInt(
    searchParams.get("serviceRowsPerPage") ?? "10",
  );

  const [searchValue, setSearchValue] = useState(serviceSearch);

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
    setSearchValue(serviceSearch);
  }, [serviceSearch]);

  // Debounce search with 400ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue === serviceSearch) return;
      updateParams({
        serviceSearch: searchValue || null,
        servicePage: 1,
      });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchValue, serviceSearch, updateParams]);

  const filteredServices = services.filter((service) => {
    // Status filter
    if (
      serviceStatusFilter &&
      service.status.toLowerCase() !== serviceStatusFilter.toLowerCase()
    ) {
      return false;
    }

    // Search filter
    if (serviceSearch) {
      const query = serviceSearch.toLowerCase();
      return (
        service.id.toLowerCase().includes(query) ||
        service.packageName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const startIndex = (servicePage - 1) * serviceRowsPerPage;
  const paginated = filteredServices.slice(
    startIndex,
    startIndex + serviceRowsPerPage,
  );
  const totalPages = Math.ceil(filteredServices.length / serviceRowsPerPage);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
        <p className="text-sm text-gray-600">View your enrolled services.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-gray-600">
              Total Services
            </div>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {services.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">All enrolled services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-gray-600">Completed</div>
            <Badge className="bg-green-100 text-green-800">
              {completedCount}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {completedCount} of {services.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-gray-600">Total Value</div>
            <Badge className="bg-purple-100 text-purple-800">৳</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total amount spent</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by order ID or package name..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select
                value={serviceStatusFilter || "all"}
                onValueChange={(value) =>
                  updateParams({
                    serviceStatus: value === "all" ? null : value,
                    servicePage: 1,
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
                    Package Name
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No services found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((service) => (
                    <TableRow key={service.id} className="hover:bg-primary-50">
                      <TableCell>
                        <CopyButton text={service.id} />
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {service.packageName}
                      </TableCell>
                      <TableCell className="text-gray-900 font-medium">
                        {formatCurrency(service.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {service.createdAt
                          ? new Date(service.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <TablePagination
            currentPage={servicePage}
            totalPages={totalPages}
            rowsPerPage={serviceRowsPerPage}
            totalRows={filteredServices.length}
            onPageChange={(page) => updateParams({ servicePage: page })}
            onRowsPerPageChange={(rows) =>
              updateParams({ serviceRowsPerPage: rows, servicePage: 1 })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
