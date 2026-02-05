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
import CopyButton from "../_components/CopyButton";
import { formatCurrency } from "../_components/formatters";
import TablePagination from "../_components/TablePagination";
import { createProduct, deleteProduct, updateProduct } from "../actions";
import type { AdminProductRow } from "../types";
import ProductDialog, { type ProductFormValues } from "./ProductDialog";

const categoryOptions = ["all", "marketing", "it", "course", "challenge"];

type ProductsClientProps = {
  products: AdminProductRow[];
};

export default function ProductsClient({ products }: ProductsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const productSearch = searchParams.get("productSearch") ?? "";
  const productCategory = searchParams.get("productCategory") ?? "all";
  const productPage = parseInt(searchParams.get("productPage") ?? "1");
  const productRowsPerPage = parseInt(
    searchParams.get("productRowsPerPage") ?? "10",
  );

  const [searchValue, setSearchValue] = useState(productSearch);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductRow | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminProductRow | null>(
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
    setSearchValue(productSearch);
  }, [productSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue === productSearch) return;
      updateParams({ productSearch: searchValue || null, productPage: 1 });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchValue, productSearch, updateParams]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.toLowerCase();
    return products.filter((product) => {
      if (productCategory !== "all" && product.category !== productCategory) {
        return false;
      }

      if (!query) return true;

      return (
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        product.code.toLowerCase().includes(query)
      );
    });
  }, [products, productCategory, productSearch]);

  const startIndex = (productPage - 1) * productRowsPerPage;
  const paginated = filteredProducts.slice(
    startIndex,
    startIndex + productRowsPerPage,
  );
  const totalPages = Math.ceil(filteredProducts.length / productRowsPerPage);

  const handleSave = (values: ProductFormValues) => {
    const parsedPrice = values.price.trim() ? Number(values.price) : null;
    if (values.price.trim() && Number.isNaN(parsedPrice)) {
      toast.error("Price must be a valid number");
      return;
    }

    const isEdit = Boolean(editingProduct);
    setActionLoading({ id: editingProduct?.id ?? "new", type: "save" });
    startTransition(async () => {
      try {
        if (isEdit && editingProduct) {
          await updateProduct(editingProduct.id, {
            name: values.name,
            slug: values.slug,
            code: values.code,
            category: values.category,
            price: parsedPrice,
            currency: values.currency || "BDT",
          });
          toast.success("Product updated");
        } else {
          await createProduct({
            name: values.name,
            slug: values.slug,
            code: values.code,
            category: values.category,
            price: parsedPrice,
            currency: values.currency || "BDT",
          });
          toast.success("Product created");
        }
        setDialogOpen(false);
        setEditingProduct(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save product",
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
        await deleteProduct(deleteTarget.id);
        toast.success("Product deleted");
        setDeleteTarget(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete product",
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
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600">
            Manage catalog items and pricing.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Input
              placeholder="Search by name, slug or code..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="max-w-xs"
            />

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select
                value={productCategory}
                onValueChange={(value) =>
                  updateParams({
                    productCategory: value === "all" ? null : value,
                    productPage: 1,
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
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">
                    Product
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Code
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Category
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Price
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    Updated
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
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <CopyButton text={product.slug} truncateLength={24} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <CopyButton text={product.code} truncateLength={12} />
                      </TableCell>
                      <TableCell className="capitalize">
                        {product.category}
                      </TableCell>
                      <TableCell>
                        {product.price === null
                          ? "Custom"
                          : formatCurrency(product.price)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {product.updatedAt
                          ? new Date(product.updatedAt).toLocaleDateString()
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
                              onClick={() => {
                                setEditingProduct(product);
                                setDialogOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(product)}
                              disabled={
                                isPending ||
                                (actionLoading?.id === product.id &&
                                  actionLoading.type === "delete")
                              }
                              className="text-red-600"
                            >
                              {actionLoading?.id === product.id &&
                              actionLoading.type === "delete" ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Deleting...
                                </span>
                              ) : (
                                "Delete"
                              )}
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
            currentPage={productPage}
            totalPages={totalPages}
            rowsPerPage={productRowsPerPage}
            totalRows={filteredProducts.length}
            onPageChange={(page) => updateParams({ productPage: page })}
            onRowsPerPageChange={(rows) =>
              updateParams({ productRowsPerPage: rows, productPage: 1 })
            }
          />
        </CardContent>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
          }
          setDialogOpen(open);
        }}
        product={editingProduct}
        isSaving={
          isPending &&
          actionLoading?.type === "save" &&
          actionLoading.id === (editingProduct?.id ?? "new")
        }
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        description={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={
          isPending &&
          actionLoading?.type === "delete" &&
          actionLoading.id === deleteTarget?.id
        }
      />
    </div>
  );
}
