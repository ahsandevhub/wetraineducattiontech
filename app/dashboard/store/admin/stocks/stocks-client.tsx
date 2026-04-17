"use client";

import TablePagination from "@/app/dashboard/admin/_components/TablePagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle, Minus, PencilLine, Plus } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "react-hot-toast";
import { recordStoreStockAction } from "../../_actions/stocks";
import { formatStoreDateTime } from "../../_lib/date-format";
import StoreStockActionDialog, {
  type StockActionFormValues,
} from "../_components/StoreStockActionDialog";

type StockProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  image_url: string | null;
  unit_price: number;
  is_active: boolean;
  tracks_stock: boolean;
  created_at: string;
  updated_at: string;
  on_hand: number;
};

type StockMovement = {
  id: string;
  product_id: string;
  stock_entry_id: string | null;
  invoice_item_id: string | null;
  reversed_from_movement_id: string | null;
  movement_type: "RESTOCK" | "SALE" | "ADJUSTMENT" | "REVERSAL";
  quantity_delta: number;
  reason: string | null;
  actor_user_id: string | null;
  created_at: string;
  product_name: string;
  actor_name: string;
  reference_id?: string | null;
};

type MovementFilters = {
  q: string;
  movementType: "all" | StockMovement["movement_type"];
  actor: string;
  page: number;
  pageSize: number;
};

type MovementPage = {
  items: StockMovement[];
  totalRows: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

type StoreStocksClientProps = {
  products: StockProduct[];
  movementPage: MovementPage;
  movementFilters: MovementFilters;
  movementActors: Array<{
    id: string;
    name: string;
  }>;
  canManageStock: boolean;
};

type DialogState = {
  open: boolean;
  initialProductId: string | null;
  initialActionType: "RESTOCK" | "DEDUCT" | "ADJUST";
};

function formatMovementType(movementType: StockMovement["movement_type"]) {
  switch (movementType) {
    case "RESTOCK":
      return "Restock";
    case "SALE":
      return "Sale";
    case "ADJUSTMENT":
      return "Adjustment";
    case "REVERSAL":
      return "Reversal";
    default:
      return movementType;
  }
}

function formatMoney(amount: number) {
  return `${amount.toFixed(2)} BDT`;
}

export function StoreStocksClient({
  products,
  movementPage,
  movementFilters,
  movementActors,
  canManageStock,
}: StoreStocksClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryRowsPerPage, setInventoryRowsPerPage] = useState(50);
  const [movementSearch, setMovementSearch] = useState(movementFilters.q);
  const [loading, setLoading] = useState(false);
  const [pendingTab, setPendingTab] = useState<"inventory" | "movements" | null>(
    null,
  );
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    initialProductId: null,
    initialActionType: "RESTOCK",
  });

  const filteredProducts = useMemo(() => {
    const query = inventorySearch.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.sku, product.barcode]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [inventorySearch, products]);
  const inventoryTotalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / inventoryRowsPerPage),
  );
  const safeInventoryPage = Math.min(inventoryPage, inventoryTotalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeInventoryPage - 1) * inventoryRowsPerPage,
    safeInventoryPage * inventoryRowsPerPage,
  );

  const totalOnHand = products.reduce(
    (sum, product) => sum + product.on_hand,
    0,
  );
  const stockValuation = products.reduce(
    (sum, product) => sum + product.on_hand * product.unit_price,
    0,
  );
  const outOfStockCount = products.filter(
    (product) => product.on_hand <= 0,
  ).length;
  const activeTab =
    searchParams.get("tab") === "movements" ? "movements" : "inventory";

  useEffect(() => {
    setMovementSearch(movementFilters.q);
  }, [movementFilters.q]);

  useEffect(() => {
    if (pendingTab === activeTab) {
      setPendingTab(null);
    }
  }, [activeTab, pendingTab]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (
          value === null ||
          value === "" ||
          (key === "page" && String(value) === "1") ||
          (key === "pageSize" && String(value) === "50") ||
          (key === "movementType" && String(value) === "all") ||
          (key === "actor" && String(value) === "all") ||
          (key === "tab" && String(value) === "inventory")
        ) {
          params.delete(key);
          continue;
        }

        params.set(key, String(value));
      }

      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const normalizedSearch = movementSearch.trim();

    if (normalizedSearch === movementFilters.q) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updateQueryParams({
        q: normalizedSearch || null,
        page: 1,
        tab: "movements",
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [movementFilters.q, movementSearch, updateQueryParams]);

  const handleSave = async (values: StockActionFormValues) => {
    setLoading(true);
    try {
      const result = await recordStoreStockAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Stock movement recorded successfully");
      setDialogState({
        open: false,
        initialProductId: null,
        initialActionType: "RESTOCK",
      });
      router.refresh();
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const visibleTab = pendingTab ?? activeTab;
  const isInventoryPending = isNavigating && pendingTab === "inventory";
  const isMovementsPending = isNavigating && pendingTab === "movements";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Stocks</h1>
          <p className="text-muted-foreground">
            Track on-hand inventory using append-only stock movements.
          </p>
        </div>
        <StoreStockActionDialog
          key={`${dialogState.initialProductId ?? "new"}-${dialogState.initialActionType}-${dialogState.open ? "open" : "closed"}`}
          open={dialogState.open}
          onOpenChange={(open) =>
            setDialogState((prev) => ({
              ...prev,
              open,
              initialProductId: open ? prev.initialProductId : null,
              initialActionType: open ? prev.initialActionType : "RESTOCK",
            }))
          }
          products={products}
          initialProductId={dialogState.initialProductId}
          initialActionType={dialogState.initialActionType}
          isSaving={loading}
          onSave={handleSave}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tracked Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Units On Hand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOnHand}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out Of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Stock Valuation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMoney(stockValuation)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={visibleTab}
        onValueChange={(value) => {
          const nextTab = value === "movements" ? "movements" : "inventory";
          setPendingTab(nextTab);
          updateQueryParams({
            tab: nextTab === "movements" ? "movements" : null,
          });
        }}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 sm:w-fit">
          <TabsTrigger value="inventory" disabled={isNavigating}>
            <span>Inventory</span>
            {isInventoryPending ? (
              <LoaderCircle className="ml-2 h-3.5 w-3.5 animate-spin" />
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="movements" disabled={isNavigating}>
            <span>Stock Movements</span>
            {isMovementsPending ? (
              <LoaderCircle className="ml-2 h-3.5 w-3.5 animate-spin" />
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          {isInventoryPending ? (
            <Card className="border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
              <CardHeader className="gap-4 px-0 pt-0 md:flex-row md:items-center md:justify-between sm:px-6 sm:pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-full md:max-w-sm" />
              </CardHeader>
              <CardContent className="space-y-4 px-0 pb-0 sm:px-6 sm:pb-6">
                <div className="overflow-hidden rounded-md border">
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Loading inventory...
                </p>
              </CardContent>
            </Card>
          ) : (
          <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
            <CardHeader className="gap-4 px-0 pt-0 md:flex-row md:items-center md:justify-between sm:px-6 sm:pt-6">
              <CardTitle>Inventory</CardTitle>
              <Input
                value={inventorySearch}
                onChange={(event) => {
                  setInventorySearch(event.target.value);
                  setInventoryPage(1);
                }}
                placeholder="Search by name, SKU, or barcode"
                className="w-full md:max-w-sm"
              />
            </CardHeader>
            <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>On Hand</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-center text-muted-foreground"
                        >
                          {products.length === 0
                            ? "No tracked stock products found"
                            : "No products match your search"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="min-w-[220px]">
                            <div className="flex items-center gap-3">
                              <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted">
                                {product.image_url ? (
                                  <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                    No image
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {product.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {product.sku ?? "No SKU"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.barcode ?? "—"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.is_active ? "default" : "secondary"
                              }
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.on_hand > 0 ? "outline" : "secondary"
                              }
                            >
                              {product.on_hand}
                            </Badge>
                          </TableCell>
                          <TableCell className="space-x-2 text-right">
                            {canManageStock ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setDialogState({
                                      open: true,
                                      initialProductId: product.id,
                                      initialActionType: "RESTOCK",
                                    })
                                  }
                                  disabled={loading}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setDialogState({
                                      open: true,
                                      initialProductId: product.id,
                                      initialActionType: "DEDUCT",
                                    })
                                  }
                                  disabled={loading}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setDialogState({
                                      open: true,
                                      initialProductId: product.id,
                                      initialActionType: "ADJUST",
                                    })
                                  }
                                  disabled={loading}
                                >
                                  <PencilLine className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Badge variant="secondary">Read only</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                currentPage={safeInventoryPage}
                totalPages={inventoryTotalPages}
                rowsPerPage={inventoryRowsPerPage}
                totalRows={filteredProducts.length}
                pageSizeOptions={[50, 100, 500]}
                onPageChange={setInventoryPage}
                onRowsPerPageChange={(rows) => {
                  setInventoryRowsPerPage(rows);
                  setInventoryPage(1);
                }}
              />
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="movements">
          {isMovementsPending ? (
            <Card className="border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
              <CardHeader className="gap-4 px-0 pt-0 md:flex-row md:items-center md:justify-between sm:px-6 sm:pt-6">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <Skeleton className="h-10 w-full md:w-80" />
                  <Skeleton className="h-10 w-full md:w-48" />
                  <Skeleton className="h-10 w-full md:w-56" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-0 pb-0 sm:px-6 sm:pb-6">
                <div className="overflow-hidden rounded-md border">
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Loading stock movements...
                </p>
              </CardContent>
            </Card>
          ) : (
          <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
            <CardHeader className="gap-4 px-0 pt-0 md:flex-row md:items-center md:justify-between sm:px-6 sm:pt-6">
              <CardTitle>Stock Movements</CardTitle>
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  value={movementSearch}
                  onChange={(event) => setMovementSearch(event.target.value)}
                  placeholder="Search by product name, SKU, or barcode"
                  className="w-full md:w-80"
                />
                <Select
                  value={movementFilters.movementType}
                  onValueChange={(value) =>
                    updateQueryParams({
                      movementType: value,
                      page: 1,
                      tab: "movements",
                    })
                  }
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="RESTOCK">Restock</SelectItem>
                    <SelectItem value="SALE">Sale</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                    <SelectItem value="REVERSAL">Reversal</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={movementFilters.actor}
                  onValueChange={(value) =>
                    updateQueryParams({
                      actor: value,
                      page: 1,
                      tab: "movements",
                    })
                  }
                >
                  <SelectTrigger className="w-full md:w-56">
                    <SelectValue placeholder="All actors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actors</SelectItem>
                    {movementActors.map((actor) => (
                      <SelectItem key={actor.id} value={actor.id}>
                        {actor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0 sm:px-6 sm:pb-6">
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Actor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movementPage.items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-8 text-center text-muted-foreground"
                        >
                          {movementPage.totalRows === 0
                            ? "No stock movement history found"
                            : "No stock movements match your filters"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      movementPage.items.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {formatStoreDateTime(movement.created_at)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {movement.product_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {formatMovementType(movement.movement_type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {movement.reference_id ?? "—"}
                          </TableCell>
                          <TableCell
                            className={
                              movement.quantity_delta > 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }
                          >
                            {movement.quantity_delta > 0 ? "+" : ""}
                            {movement.quantity_delta}
                          </TableCell>
                          <TableCell className="max-w-[320px] truncate">
                            {movement.reason ?? "—"}
                          </TableCell>
                          <TableCell>{movement.actor_name}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                currentPage={movementPage.page}
                totalPages={movementPage.totalPages}
                rowsPerPage={movementPage.pageSize}
                totalRows={movementPage.totalRows}
                pageSizeOptions={[50, 100, 500]}
                onPageChange={(page) =>
                  updateQueryParams({
                    page,
                    tab: "movements",
                  })
                }
                onRowsPerPageChange={(rows) =>
                  updateQueryParams({
                    pageSize: rows,
                    page: 1,
                    tab: "movements",
                  })
                }
              />
              {isNavigating ? (
                <p className="text-xs text-muted-foreground">
                  Updating movement history...
                </p>
              ) : null}
            </CardContent>
          </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
