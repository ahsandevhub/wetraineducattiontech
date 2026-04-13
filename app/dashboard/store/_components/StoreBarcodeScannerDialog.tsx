"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type StoreBarcodeScannerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onBarcodeDetected: (barcode: string) => void;
  children?: React.ReactNode;
  manualLabel?: string;
  manualPlaceholder?: string;
  findButtonLabel?: string;
  footer?: React.ReactNode;
  fallbackHint?: string;
  idleHint?: string;
};

export function StoreBarcodeScannerDialog({
  open,
  onOpenChange,
  title,
  description,
  onBarcodeDetected,
  children,
  manualLabel = "Barcode",
  manualPlaceholder = "Type or paste barcode number",
  findButtonLabel = "Find Product",
  footer,
  fallbackHint = "Use this fallback if camera scanning is unavailable or misses the barcode.",
  idleHint = "If scanning does not work, use the manual barcode lookup in this dialog.",
}: StoreBarcodeScannerDialogProps) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [scannerMessage, setScannerMessage] = useState("");
  const [isStartingScanner, setIsStartingScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasProcessedScanRef = useRef(false);
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null);

  const isScannerSupported =
    typeof window !== "undefined" &&
    typeof window.BarcodeDetector !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  const scannerStatusText = useMemo(() => {
    if (!isScannerSupported) {
      return "Barcode scanning is not available on this device. You can still enter a barcode manually below.";
    }

    return scannerMessage;
  }, [isScannerSupported, scannerMessage]);

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
      if (!normalizedBarcode) {
        return;
      }

      hasProcessedScanRef.current = true;
      setScannerMessage(`Detected barcode ${normalizedBarcode}.`);
      onBarcodeDetected(normalizedBarcode);
      stopScanner();
    },
    [onBarcodeDetected, stopScanner],
  );

  const handleManualLookup = useCallback(() => {
    const normalizedBarcode = manualBarcode.trim();
    if (!normalizedBarcode) {
      setScannerMessage("Enter a barcode first.");
      return;
    }

    handleDetectedBarcode(normalizedBarcode);
  }, [handleDetectedBarcode, manualBarcode]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        cleanupScannerResources();
        setManualBarcode("");
        setScannerMessage("");
      }

      onOpenChange(nextOpen);
    },
    [cleanupScannerResources, onOpenChange],
  );

  useEffect(() => {
    if (!open || !isScannerSupported) {
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
            "Barcode scanning is not supported here. Enter a barcode manually below.",
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
              "Unable to detect a barcode from the camera feed. Try manual barcode lookup below.",
            );
          }
        }, 500);
      } catch (error) {
        console.error("Failed to start barcode scanner:", error);
        setScannerMessage(
          "Camera access was blocked or unavailable. Enter a barcode manually below.",
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
  }, [cleanupScannerResources, handleDetectedBarcode, isScannerSupported, open]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            <Label htmlFor="shared-manual-barcode">{manualLabel}</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="shared-manual-barcode"
                value={manualBarcode}
                onChange={(event) => setManualBarcode(event.target.value)}
                placeholder={manualPlaceholder}
              />
              <Button
                type="button"
                onClick={handleManualLookup}
                className="w-full sm:w-auto"
              >
                {findButtonLabel}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{fallbackHint}</p>
          </div>

          {children}

          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            {isStartingScanner ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {scannerStatusText || "Starting scanner..."}
              </span>
            ) : scannerStatusText ? (
              scannerStatusText
            ) : (
              idleHint
            )}
          </div>
        </div>

        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
