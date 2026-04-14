"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatStoreDateTime } from "../../_lib/date-format";
import { Minus, PencilLine, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { recordStoreStockAction } from "../../_actions/stocks";
import StoreStockActionDialog, {
  type StockActionFormValues,
} from "../_components/StoreStockActionDialog";

type StockProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
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

type StoreStocksClientProps = {
  products: StockProduct[];
  movementHistory: StockMovement[];
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
  movementHistory,
}: StoreStocksClientProps) {
  const router = useRouter();
  const [inventorySearch, setInventorySearch] = useState("");
  const [movementSearch, setMovementSearch] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState<
    "all" | StockMovement["movement_type"]
  >("all");
  const [movementActorFilter, setMovementActorFilter] = useState("all");
  const [loading, setLoading] = useState(false);
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

  const movementActors = useMemo(
    () =>
      Array.from(
        new Set(
          movementHistory
            .map((movement) => movement.actor_name)
            .filter((actorName) => actorName.trim().length > 0),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [movementHistory],
  );

  const filteredMovementHistory = useMemo(() => {
    const query = movementSearch.trim().toLowerCase();

    return movementHistory.filter((movement) => {
      if (
        movementTypeFilter !== "all" &&
        movement.movement_type !== movementTypeFilter
      ) {
        return false;
      }

      if (
        movementActorFilter !== "all" &&
        movement.actor_name !== movementActorFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        movement.product_name.toLowerCase().includes(query) ||
        movement.actor_name.toLowerCase().includes(query) ||
        formatMovementType(movement.movement_type)
          .toLowerCase()
          .includes(query) ||
        (movement.reason ?? "").toLowerCase().includes(query) ||
        (movement.reference_id ?? "").toLowerCase().includes(query)
      );
    });
  }, [
    movementActorFilter,
    movementHistory,
    movementSearch,
    movementTypeFilter,
  ]);

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

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:w-fit">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
            <CardHeader className="gap-4 px-0 pt-0 md:flex-row md:items-center md:justify-between sm:px-6 sm:pt-6">
              <CardTitle>Inventory</CardTitle>
              <Input
                value={inventorySearch}
                onChange={(event) => setInventorySearch(event.target.value)}
                placeholder="Search by name or barcode"
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
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
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
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card className="space-y-4 border-0 bg-transparent py-0 shadow-none sm:border sm:bg-card sm:shadow-sm">
            <CardHeader className="gap-4 px-0 pt-0 md:flex-row md:items-center md:justify-between sm:px-6 sm:pt-6">
              <CardTitle>Recent Stock Movements</CardTitle>
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  value={movementSearch}
                  onChange={(event) => setMovementSearch(event.target.value)}
                  placeholder="Search product, reason, reference, or actor"
                  className="w-full md:w-80"
                />
                <Select
                  value={movementTypeFilter}
                  onValueChange={(value) =>
                    setMovementTypeFilter(
                      value as "all" | StockMovement["movement_type"],
                    )
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
                  value={movementActorFilter}
                  onValueChange={setMovementActorFilter}
                >
                  <SelectTrigger className="w-full md:w-56">
                    <SelectValue placeholder="All actors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actors</SelectItem>
                    {movementActors.map((actorName) => (
                      <SelectItem key={actorName} value={actorName}>
                        {actorName}
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
                    {filteredMovementHistory.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-8 text-center text-muted-foreground"
                        >
                          {movementHistory.length === 0
                            ? "No stock movement history found"
                            : "No stock movements match your filters"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMovementHistory.map((movement) => (
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
