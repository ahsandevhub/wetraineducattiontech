"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Camera,
  Check,
  ChevronsUpDown,
  Loader2,
  Minus,
  Plus,
  ScanBarcode,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "react-hot-toast";
import { createStoreInvoice } from "../../_actions/invoices";

type BarcodeDetectorResult = {
  rawValue?: string;
};

type BarcodeDetectorInstance = {
  detect: (source: ImageBitmapSource) => Promise<BarcodeDetectorResult[]>;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorInstance;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

type StoreInvoiceProduct = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit_price: number;
  tracks_stock: boolean;
  stock_quantity: number | null;
};

type DraftItem = {
  productId: string;
  quantity: number;
};

type Props = {
  products: StoreInvoiceProduct[];
  currentBalance: number;
  customer: {
    name: string;
    email: string | null;
  };
};

export function InvoiceBuilderClient({
  products,
  currentBalance,
  customer,
}: Props) {
  const [productOpen, setProductOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isStartingScanner, setIsStartingScanner] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [scannedProductId, setScannedProductId] = useState("");
  const [scannerQuantity, setScannerQuantity] = useState("1");
  const [isPending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasProcessedScanRef = useRef(false);
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null);

  const isScannerSupported =
    typeof window !== "undefined" &&
    typeof window.BarcodeDetector !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  const scannerStatusText = !isScannerSupported
    ? "Barcode scanning is not available on this device. Please use product search instead."
    : scannerMessage;

  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? null;
  const scannedProduct =
    products.find((product) => product.id === scannedProductId) ?? null;

  const draftRows = useMemo(() => {
    return draftItems
      .map((item) => {
        const product = products.find(
          (productRow) => productRow.id === item.productId,
        );
        if (!product) {
          return null;
        }

        return {
          ...item,
          product,
          lineTotal: Number((product.unit_price * item.quantity).toFixed(2)),
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [draftItems, products]);

  const invoiceTotal = useMemo(
    () => draftRows.reduce((sum, item) => sum + item.lineTotal, 0),
    [draftRows],
  );

  const projectedBalance = Number((currentBalance - invoiceTotal).toFixed(2));
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-BD", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [product.name, product.sku, product.barcode]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  }, [products, searchQuery]);

  const cleanupScannerResources = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    detectorRef.current = null;
    hasProcessedScanRef.current = false;
  }, []);

  const stopScanner = useCallback(() => {
    cleanupScannerResources();
    setIsStartingScanner(false);
  }, [cleanupScannerResources]);

  const handleDetectedBarcode = useCallback(
    (barcode: string) => {
      const normalizedBarcode = barcode.trim();
      const product = products.find(
        (productRow) => productRow.barcode?.trim() === normalizedBarcode,
      );

      if (!product) {
        setScannedProductId("");
        setScannerQuantity("1");
        setScannerMessage(
          `No active product was found for barcode ${normalizedBarcode}. You can still use manual search.`,
        );
        return;
      }

      hasProcessedScanRef.current = true;
      setScannedProductId(product.id);
      setScannerQuantity("1");
      setScannerMessage(`Matched ${product.name}. Set quantity and add it.`);
      toast.success(`Scanned ${product.name}`);
      stopScanner();
    },
    [products, stopScanner],
  );

  const handleBarcodeLookup = useCallback(() => {
    const normalizedBarcode = manualBarcode.trim();
    if (!normalizedBarcode) {
      toast.error("Enter a barcode first");
      return;
    }

    handleDetectedBarcode(normalizedBarcode);
  }, [handleDetectedBarcode, manualBarcode]);

  useEffect(() => {
    if (!isScannerOpen) {
      cleanupScannerResources();
      return;
    }

    if (!isScannerSupported) {
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      setIsStartingScanner(true);
      setScannerMessage("Starting camera...");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
          },
          audio: false,
        });

        if (cancelled) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const Detector = window.BarcodeDetector;
        if (!Detector) {
          setScannerMessage(
            "Barcode scanning is not supported here. Please use product search instead.",
          );
          cleanupScannerResources();
          setIsStartingScanner(false);
          return;
        }

        detectorRef.current = new Detector({
          formats: [
            "ean_13",
            "ean_8",
            "upc_a",
            "upc_e",
            "code_128",
            "code_39",
            "qr_code",
          ],
        });

        setScannerMessage("Point the camera at a product barcode.");
        setIsStartingScanner(false);

        scanIntervalRef.current = setInterval(async () => {
          if (
            cancelled ||
            hasProcessedScanRef.current ||
            !videoRef.current ||
            !detectorRef.current
          ) {
            return;
          }

          try {
            const results = await detectorRef.current.detect(videoRef.current);
            const firstResult = results.find((result) =>
              result.rawValue?.trim(),
            );
            if (firstResult?.rawValue) {
              handleDetectedBarcode(firstResult.rawValue);
            }
          } catch {
            setScannerMessage(
              "Unable to detect a barcode from the camera feed. Try manual search if this keeps happening.",
            );
          }
        }, 500);
      } catch (error) {
        console.error("Failed to start barcode scanner:", error);
        setScannerMessage(
          "Camera access was blocked or unavailable. Please use product search instead.",
        );
        setIsStartingScanner(false);
        cleanupScannerResources();
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      cleanupScannerResources();
    };
  }, [
    cleanupScannerResources,
    handleDetectedBarcode,
    isScannerOpen,
    isScannerSupported,
  ]);

  const resetSearchDialog = useCallback(() => {
    setProductOpen(false);
    setSearchQuery("");
    setSelectedProductId("");
    setQuantity("1");
  }, []);

  const resetScannerDialog = useCallback(() => {
    setScannerMessage("");
    setManualBarcode("");
    setScannedProductId("");
    setScannerQuantity("1");
    stopScanner();
  }, [stopScanner]);

  const addItemToDraft = useCallback(
    (productId: string, qtyValue: string) => {
      if (!productId) {
        toast.error("Please select a product");
        return false;
      }

      const parsedQty = Number(qtyValue);
      if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
        toast.error("Quantity must be a whole number greater than zero");
        return false;
      }

      const product = products.find(
        (productRow) => productRow.id === productId,
      );
      if (!product) {
        toast.error("Selected product could not be found");
        return false;
      }

      setDraftItems((current) => {
        const existing = current.find((item) => item.productId === productId);
        if (existing) {
          return current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + parsedQty }
              : item,
          );
        }

        return [...current, { productId, quantity: parsedQty }];
      });

      toast.success(`${product.name} added to invoice`);
      return true;
    },
    [products],
  );

  const addManualDraftItem = () => {
    const added = addItemToDraft(selectedProductId, quantity);
    if (!added) {
      return;
    }

    resetSearchDialog();
    setIsSearchDialogOpen(false);
  };

  const addScannedDraftItem = () => {
    const added = addItemToDraft(scannedProductId, scannerQuantity);
    if (!added) {
      return;
    }

    resetScannerDialog();
    setIsScannerOpen(false);
  };

  const adjustDraftQuantity = (productId: string, delta: number) => {
    setDraftItems((current) =>
      current.flatMap((item) => {
        if (item.productId !== productId) {
          return [item];
        }

        const nextQuantity = item.quantity + delta;
        if (nextQuantity <= 0) {
          return [];
        }

        return [{ ...item, quantity: nextQuantity }];
      }),
    );
  };

  const removeDraftItem = (productId: string) => {
    setDraftItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  const handleConfirmSave = async () => {
    if (draftItems.length === 0) {
      toast.error("Add at least one item before saving");
      return;
    }

    startTransition(async () => {
      const result = await createStoreInvoice({ items: draftItems });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Invoice saved successfully");
      setDraftItems([]);
      setIsConfirmOpen(false);
    });
  };

  const renderDraftTable = () => (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead className="text-center">Qty</TableHead>
            <TableHead className="text-right">Line Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {draftRows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-muted-foreground"
              >
                No items added yet. Use Search Item or Scan Barcode to start
                this invoice.
              </TableCell>
            </TableRow>
          ) : (
            draftRows.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <div className="flex min-w-[220px] items-center gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg border bg-muted/30">
                      <Image
                        src="/product-placeholder.png"
                        alt=""
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.product.sku
                          ? `SKU: ${item.product.sku}`
                          : item.product.barcode
                            ? `# ${item.product.barcode}`
                            : "No SKU or barcode"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        In stock: {item.product.stock_quantity ?? "N/A"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {item.product.unit_price.toFixed(2)} BDT
                </TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center rounded-full border bg-muted/20 px-2 py-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 rounded-full p-0"
                      onClick={() => adjustDraftQuantity(item.productId, -1)}
                      disabled={item.quantity <= 1}
                      aria-label={`Decrease quantity for ${item.product.name}`}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="inline-flex min-w-8 items-center justify-center text-sm font-medium">
                      {item.quantity}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 rounded-full p-0"
                      onClick={() => adjustDraftQuantity(item.productId, 1)}
                      aria-label={`Increase quantity for ${item.product.name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-right font-medium">
                  {item.lineTotal.toFixed(2)} BDT
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDraftItem(item.productId)}
                      aria-label={`Remove ${item.product.name} from invoice`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="md:space-y-6">
      <div className="flex flex-col sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Invoice</h1>
          <p className="hidden text-muted-foreground sm:block">
            Search products, build a draft invoice, then confirm before saving.
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <div className="text-sm text-muted-foreground">
            Current balance:{" "}
            <span className="font-medium">{currentBalance.toFixed(2)} BDT</span>
          </div>
          <div className="hidden sm:flex sm:flex-row sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsSearchDialogOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              Search Item
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScannerOpen(true)}
              className="w-full sm:w-auto"
            >
              <ScanBarcode className="mr-2 h-4 w-4" />
              Scan Barcode
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed right-4 bottom-4 z-30 flex flex-col gap-3 sm:hidden">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-border/70 bg-background/95 shadow-lg backdrop-blur"
          onClick={() => setIsSearchDialogOpen(true)}
          aria-label="Search item"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Button
          type="button"
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsScannerOpen(true)}
          aria-label="Scan barcode"
        >
          <ScanBarcode className="h-6 w-6" />
        </Button>
      </div>

      <Dialog
        open={isSearchDialogOpen}
        onOpenChange={(open) => {
          setIsSearchDialogOpen(open);
          if (!open) {
            resetSearchDialog();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Search Item</DialogTitle>
            <DialogDescription>
              Search the Store catalog, set quantity, and add the item to this
              invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Product</Label>
              <Popover open={productOpen} onOpenChange={setProductOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={productOpen}
                    className="w-full justify-between"
                  >
                    {selectedProduct
                      ? `${selectedProduct.name} (${selectedProduct.unit_price.toFixed(2)} BDT)`
                      : "Select product..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search by name, SKU, or barcode..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      {filteredProducts.length === 0 ? (
                        <CommandEmpty>No products found.</CommandEmpty>
                      ) : (
                        filteredProducts.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={[
                              product.name,
                              product.sku ?? "",
                              product.barcode ?? "",
                            ]
                              .join(" ")
                              .trim()}
                            onSelect={() => {
                              setSelectedProductId(product.id);
                              setProductOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProductId === product.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {product.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {product.unit_price.toFixed(2)} BDT
                                {product.sku ? ` • ${product.sku}` : ""}
                                {product.barcode ? ` • ${product.barcode}` : ""}
                              </span>
                            </div>
                          </CommandItem>
                        ))
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-invoice-qty">Qty</Label>
              <Input
                id="manual-invoice-qty"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="mt-3 sm:mt-0"
              type="button"
              variant="outline"
              onClick={() => setIsSearchDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={addManualDraftItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mx-auto py-3 w-full max-w-5xl border-0 bg-transparent shadow-none md:border md:border-border/70 md:bg-card md:shadow-md">
        <CardContent className="space-y-6 px-0 py-0 sm:px-2 sm:py-2 md:px-6 md:py-6 lg:px-8">
          <div className="flex flex-col gap-5 border-b border-dashed pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="hidden md:block space-y-2">
              <div className="inline-flex rounded-full border border-amber-200 bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-800">
                Draft Invoice
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Store Purchase Draft
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review items before saving this self-service invoice.
                </p>
              </div>
            </div>

            <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 text-sm sm:grid-cols-2 lg:min-w-[380px]">
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Employee
                </div>
                <div className="font-medium text-foreground">
                  {customer.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {customer.email ?? "No email available"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Date
                </div>
                <div className="font-medium text-foreground">{todayLabel}</div>
                <div className="text-xs text-muted-foreground">
                  Draft preview only
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current Balance
                </div>
                <div
                  className={cn(
                    "text-base font-semibold",
                    currentBalance < 0
                      ? "text-red-600"
                      : currentBalance > 0
                        ? "text-emerald-600"
                        : "text-foreground",
                  )}
                >
                  {currentBalance.toFixed(2)} BDT
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Items
                </div>
                <div className="font-medium text-foreground">
                  {draftRows.length} line{draftRows.length === 1 ? "" : "s"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Quantity can be adjusted until save
                </div>
              </div>
            </div>
          </div>

          {renderDraftTable()}

          <div className="flex flex-col gap-4 rounded-xl border border-dashed bg-muted/10 p-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-8 border-b border-dashed pb-2">
                <span className="text-muted-foreground">Invoice total</span>
                <span className="text-lg font-semibold text-foreground">
                  {invoiceTotal.toFixed(2)} BDT
                </span>
              </div>
              <div className="flex items-center justify-between gap-8">
                <span className="text-muted-foreground">
                  Projected balance after save
                </span>
                <span
                  className={cn(
                    "text-base font-semibold",
                    projectedBalance < 0
                      ? "text-red-600"
                      : projectedBalance > 0
                        ? "text-emerald-600"
                        : "text-foreground",
                  )}
                >
                  {projectedBalance.toFixed(2)} BDT
                </span>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-2 lg:items-end">
              <div className="text-xs text-muted-foreground">
                Saving will create the purchase record and deduct the balance.
              </div>
              <Button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                disabled={draftRows.length === 0 || isPending}
                className={cn("min-w-[180px]", "w-full sm:w-auto")}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Review & Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Review the summary below before saving. This will create a
              purchase record and deduct your balance.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 text-sm">
            {draftRows.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <div className="font-medium">{item.product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Qty {item.quantity} × {item.product.unit_price.toFixed(2)}{" "}
                    BDT
                  </div>
                </div>
                <div className="font-medium">
                  {item.lineTotal.toFixed(2)} BDT
                </div>
              </div>
            ))}

            <div className="rounded-md bg-muted p-3">
              <div>
                Total:{" "}
                <span className="font-medium">
                  {invoiceTotal.toFixed(2)} BDT
                </span>
              </div>
              <div>
                New balance:{" "}
                <span className="font-medium">
                  {projectedBalance.toFixed(2)} BDT
                </span>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isScannerOpen}
        onOpenChange={(open) => {
          setIsScannerOpen(open);
          if (!open) {
            resetScannerDialog();
          }
        }}
      >
        <DialogContent
          className="max-w-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Scan or Enter Barcode</DialogTitle>
            <DialogDescription>
              Scan a product barcode or enter it manually, then confirm quantity
              before adding the product to the invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border bg-black">
              {isScannerSupported ? (
                <video
                  ref={videoRef}
                  className="aspect-video w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center text-sm text-white/80">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Camera className="h-8 w-8" />
                    Barcode scanning is unavailable on this device.
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-barcode">Barcode</Label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id="manual-barcode"
                  value={manualBarcode}
                  onChange={(event) => setManualBarcode(event.target.value)}
                  placeholder="Type or paste barcode number"
                />
                <Button
                  type="button"
                  onClick={handleBarcodeLookup}
                  className="w-full sm:w-auto"
                >
                  Find Product
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this fallback if camera scanning is unavailable or misses
                the barcode.
              </p>
            </div>

            {scannedProduct ? (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Matched Product
                  </div>
                  <div className="font-medium">{scannedProduct.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {scannedProduct.unit_price.toFixed(2)} BDT
                    {scannedProduct.barcode
                      ? ` • ${scannedProduct.barcode}`
                      : ""}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scanner-qty">Qty</Label>
                  <Input
                    id="scanner-qty"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={scannerQuantity}
                    onChange={(event) => setScannerQuantity(event.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
              {isStartingScanner ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {scannerStatusText || "Starting scanner..."}
                </span>
              ) : scannerStatusText ? (
                scannerStatusText
              ) : (
                "If scanning does not work, close this dialog and use the search field instead."
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              className="mt-3 sm:mt-0"
              type="button"
              variant="outline"
              onClick={() => setIsScannerOpen(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={addScannedDraftItem}
              disabled={!scannedProduct}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
