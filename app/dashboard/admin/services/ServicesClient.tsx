"use client";

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
import { Filter, Loader2, MoreHorizontal, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "react-hot-toast";
import { ConfirmDialog } from "../_components/ConfirmDialog";
import { formatCurrency } from "../_components/formatters";
import TablePagination from "../_components/TablePagination";
import { createService, deleteService, updateService } from "../actions";
import type { AdminServiceRow } from "../types";
import ServiceDialog, { type ServiceFormValues } from "./ServiceDialog";

const categoryOptions = ["all", "course", "software", "marketing"];

type ServicesClientProps = {
  services: AdminServiceRow[];
};

export default function ServicesClient({ services }: ServicesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const serviceSearch = searchParams.get("serviceSearch") ?? "";
  const serviceCategory = searchParams.get("serviceCategory") ?? "all";
  const servicePage = parseInt(searchParams.get("servicePage") ?? "1");
  const serviceRowsPerPage = parseInt(
    searchParams.get("serviceRowsPerPage") ?? "10",
  );

  const [searchValue, setSearchValue] = useState(serviceSearch);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminServiceRow | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminServiceRow | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState<{
    id: string;
    type: "save" | "delete";
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
    setSearchValue(serviceSearch);
  }, [serviceSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue === serviceSearch) return;
      updateParams({ serviceSearch: searchValue || null, servicePage: 1 });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchValue, serviceSearch, updateParams]);

  const filteredServices = useMemo(() => {
    const query = serviceSearch.toLowerCase();
    return services.filter((service) => {
      if (serviceCategory !== "all" && service.category !== serviceCategory) {
        return false;
      }

      if (!query) return true;

      return (
        service.title.toLowerCase().includes(query) ||
        service.slug.toLowerCase().includes(query)
      );
    });
  }, [services, serviceCategory, serviceSearch]);

  const startIndex = (servicePage - 1) * serviceRowsPerPage;
  const paginated = filteredServices.slice(
    startIndex,
    startIndex + serviceRowsPerPage,
  );
  const totalPages = Math.ceil(filteredServices.length / serviceRowsPerPage);

  const handleSave = (values: ServiceFormValues) => {
    if (!values.featuredImageUrl) {
      toast.error("Featured image is required");
      return;
    }

    const parsedPrice = values.price.trim() ? Number(values.price) : null;
    const parsedDiscount = values.discount.trim()
      ? Number(values.discount)
      : null;

    if (values.price.trim() && Number.isNaN(parsedPrice)) {
      toast.error("Price must be a valid number");
      return;
    }

    if (values.discount.trim() && Number.isNaN(parsedDiscount)) {
      toast.error("Discount must be a valid number");
      return;
    }

    const cleanedFeatures = values.keyFeatures
      .map((feature) => feature.trim())
      .filter(Boolean);

    const isEdit = Boolean(editingService);
    setActionLoading({ id: editingService?.id ?? "new", type: "save" });
    startTransition(async () => {
      try {
        if (isEdit && editingService) {
          await updateService(editingService.id, {
            title: values.title,
            slug: values.slug,
            category: values.category,
            price: parsedPrice,
            discount: parsedDiscount,
            currency: values.currency || "BDT",
            details: values.details,
            keyFeatures: cleanedFeatures,
            featuredImageUrl: values.featuredImageUrl,
          });
          toast.success("Service updated");
        } else {
          await createService({
            title: values.title,
            slug: values.slug,
            category: values.category,
            price: parsedPrice,
            discount: parsedDiscount,
            currency: values.currency || "BDT",
            details: values.details,
            keyFeatures: cleanedFeatures,
            featuredImageUrl: values.featuredImageUrl,
          });
          toast.success("Service created");
        }
        setDialogOpen(false);
        setEditingService(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save service",
        );
      } finally {
        setActionLoading(null);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setActionLoading({ id: deleteTarget.id, type: "delete" });
    startTransition(async () => {
      try {
        await deleteService(deleteTarget.id);
        toast.success("Service deleted");
        setDeleteTarget(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete service",
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
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-600">
            Manage courses, software, and marketing services.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingService(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Input
              placeholder="Search by title or slug..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="max-w-xs"
            />

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select
                value={serviceCategory}
                onValueChange={(value) =>
                  updateParams({
                    serviceCategory: value === "all" ? null : value,
                    servicePage: 1,
                  })
                }
              >
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-primary-100">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">
                    Service
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Price
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Discount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Updated
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((service) => (
                  <TableRow key={service.id} className="hover:bg-primary-50">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-gray-900">
                          {service.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{service.slug}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {service.category}
                    </TableCell>
                    <TableCell>
                      {service.price === null
                        ? "Custom"
                        : service.currency === "BDT"
                          ? formatCurrency(service.price)
                          : `${service.currency} ${service.price.toLocaleString()}`}
                    </TableCell>
                    <TableCell>
                      {service.discount === null ? "—" : `${service.discount}`}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {service.updatedAt
                        ? new Date(service.updatedAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={
                              actionLoading?.id === service.id &&
                              actionLoading.type === "save"
                            }
                          >
                            {actionLoading?.id === service.id &&
                            actionLoading.type === "save" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingService(service);
                              setDialogOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteTarget(service)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {paginated.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="text-sm text-gray-500">
                        No services found.
                      </div>
                    </TableCell>
                  </TableRow>
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

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingService(null);
        }}
        service={editingService}
        isSaving={isPending || actionLoading?.type === "save"}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete service"
        description={`Are you sure you want to delete ${deleteTarget?.title ?? "this service"}? This action cannot be undone.`}
        confirmText={
          actionLoading?.type === "delete" ? "Deleting..." : "Delete"
        }
        isLoading={actionLoading?.type === "delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
