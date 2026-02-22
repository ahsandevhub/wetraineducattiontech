"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import {
  DATE_RANGE_PRESETS,
  getEndOfDayUTC,
  getStartOfDayUTC,
} from "./dateUtils";

export interface ExportModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  onExport: (filters: ExportFilters) => Promise<void>;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export interface ExportFilters {
  startDate: Date;
  endDate: Date;
  [key: string]: unknown;
}

export function ExportModal({
  open,
  title,
  description,
  onClose,
  onExport,
  isLoading = false,
  children,
}: ExportModalProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: getStartOfDayUTC(new Date()),
    to: getEndOfDayUTC(new Date()),
  });

  const handleQuickSelect = (
    preset: "last7Days" | "last30Days" | "last3Months",
  ) => {
    const range = DATE_RANGE_PRESETS[preset]();
    setDate({ from: range.start, to: range.end });
  };

  const handleExport = async () => {
    if (!date?.from || !date?.to) {
      return;
    }
    await onExport({
      startDate: date.from,
      endDate: date.to,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          {/* Children filters (status, method, etc.) */}
          {children}

          {/* Date Range Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Date Range</label>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickSelect("last7Days")}
              >
                Last 7 Days
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickSelect("last30Days")}
              >
                Last 30 Days
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickSelect("last3Months")}
              >
                Last 3 Months
              </Button>
            </div>

            {/* Range Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker-range"
                  className="w-full justify-start px-2.5 font-normal"
                >
                  <CalendarIcon />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isLoading || !date?.from || !date?.to}
          >
            {isLoading ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
