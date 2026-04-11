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
  Plus,
  ScanBarcode,
  Trash2,
} from "lucide-react";
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
};

type DraftItem = {
  productId: string;
  quantity: number;
};

type Props = {
  products: StoreInvoiceProduct[];
  currentBalance: number;
};

export function InvoiceBuilderClient({ products, currentBalance }: Props) {
  const [productOpen, setProductOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isStartingScanner, setIsStartingScanner] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
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
        setScannerMessage(
          `No active product was found for barcode ${normalizedBarcode}. You can still use manual search.`,
        );
        return;
      }

      hasProcessedScanRef.current = true;
      setSelectedProductId(product.id);
      setSearchQuery(product.name);
      setQuantity("1");
      setProductOpen(false);
      setScannerMessage(`Matched ${product.name}. Set quantity and add it.`);
      toast.success(`Scanned ${product.name}`);
      stopScanner();
      setIsScannerOpen(false);
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

  const addDraftItem = () => {
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      toast.error("Quantity must be a whole number greater than zero");
      return;
    }

    setDraftItems((current) => {
      const existing = current.find(
        (item) => item.productId === selectedProductId,
      );
      if (existing) {
        return current.map((item) =>
          item.productId === selectedProductId
            ? { ...item, quantity: item.quantity + parsedQty }
            : item,
        );
      }

      return [
        ...current,
        { productId: selectedProductId, quantity: parsedQty },
      ];
    });

    setQuantity("1");
    setSearchQuery("");
    setSelectedProductId("");
    setProductOpen(false);
  };

  const updateDraftQuantity = (productId: string, nextValue: string) => {
    const parsedQty = Number(nextValue);
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      return;
    }

    setDraftItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: parsedQty } : item,
      ),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">New Invoice</h1>
          <p className="text-muted-foreground sm:block hidden">
            Search products, build a draft invoice, then confirm before saving.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Current balance:{" "}
          <span className="font-medium">{currentBalance.toFixed(2)} BDT</span>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Use manual search or scan a barcode to pick a product quickly.
          </div>
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
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px_auto]">
          <div className="space-y-2">
            <Label>Search Item</Label>
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
                            <span className="font-medium">{product.name}</span>
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
            <Label htmlFor="invoice-qty">Qty</Label>
            <Input
              id="invoice-qty"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={addDraftItem}
              className="w-full md:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Line Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draftRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No items added yet
                </TableCell>
              </TableRow>
            ) : (
              draftRows.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">
                    {item.product.name}
                    <div className="text-xs text-muted-foreground">
                      {item.product.sku ??
                        item.product.barcode ??
                        "No SKU/barcode"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.product.unit_price.toFixed(2)} BDT
                  </TableCell>
                  <TableCell className="w-[120px]">
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={item.quantity}
                      onChange={(event) =>
                        updateDraftQuantity(item.productId, event.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    {item.lineTotal.toFixed(2)} BDT
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDraftItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>
            Invoice total:{" "}
            <span className="font-medium text-foreground">
              {invoiceTotal.toFixed(2)} BDT
            </span>
          </div>
          <div>
            Projected balance after save:{" "}
            <span
              className={cn(
                "font-medium",
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
        <Button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={draftRows.length === 0 || isPending}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Review & Save
        </Button>
      </div>

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
            setScannerMessage("");
            setManualBarcode("");
            stopScanner();
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
            <DialogDescription>
              Scan a product barcode to select it, then choose quantity and add
              it to the invoice.
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
                  autoFocus={false}
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
              type="button"
              variant="outline"
              onClick={() => setIsScannerOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
