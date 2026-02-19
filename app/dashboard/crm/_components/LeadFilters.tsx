"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LEAD_STATUS_OPTIONS } from "../_constants/lead-status";

interface LeadFiltersProps {
  marketers: { id: string; full_name: string | null }[];
  isAdmin: boolean;
}

export function LeadFilters({ marketers, isAdmin }: LeadFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSyncingFromUrlRef = useRef(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [source, setSource] = useState(searchParams.get("source") || "all");
  const [owner, setOwner] = useState(
    isAdmin ? searchParams.get("owner") || "all" : "all",
  );
  const [fromDate, setFromDate] = useState<Date | undefined>(() => {
    const dateParam = searchParams.get("from");
    return dateParam ? new Date(dateParam + "T00:00:00") : undefined;
  });
  const [toDate, setToDate] = useState<Date | undefined>(() => {
    const dateParam = searchParams.get("to");
    return dateParam ? new Date(dateParam + "T00:00:00") : undefined;
  });

  const [isFromDatePickerOpen, setIsFromDatePickerOpen] = useState(false);
  const [isToDatePickerOpen, setIsToDatePickerOpen] = useState(false);

  const hasFilters =
    search ||
    status !== "all" ||
    source !== "all" ||
    owner !== "all" ||
    fromDate ||
    toDate;

  // Effect 1: Sync state from URL (never triggers navigation)
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setStatus(searchParams.get("status") || "all");
    setSource(searchParams.get("source") || "all");
    if (isAdmin) {
      setOwner(searchParams.get("owner") || "all");
    } else {
      setOwner("all");
    }

    const dateParam = searchParams.get("from");
    setFromDate(dateParam ? new Date(dateParam + "T00:00:00") : undefined);

    const toDateParam = searchParams.get("to");
    setToDate(toDateParam ? new Date(toDateParam + "T00:00:00") : undefined);

    // Mark the end of URL sync so user action effects can run
    requestAnimationFrame(() => {
      isSyncingFromUrlRef.current = false;
    });
  }, [searchParams, isAdmin]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    // Preserve current page number
    const currentPage = searchParams.get("page");
    if (currentPage) params.set("page", currentPage);

    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    if (source && source !== "all") params.set("source", source);
    if (isAdmin && owner && owner !== "all") params.set("owner", owner);
    if (fromDate) params.set("from", format(fromDate, "yyyy-MM-dd"));
    if (toDate) params.set("to", format(toDate, "yyyy-MM-dd"));

    router.push(`/dashboard/crm/leads?${params.toString()}`, { scroll: false });
  };

  // Effect 2: Apply filters on user action (immediately on select/date changes)
  useEffect(() => {
    if (isSyncingFromUrlRef.current) return;
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, source, owner, fromDate, toDate]);

  // Effect 3: Debounced search - apply filters after user stops typing
  useEffect(() => {
    if (isSyncingFromUrlRef.current) return;

    const debounceTimer = setTimeout(() => {
      applyFilters();
    }, 500); // 500ms delay after user stops typing

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setSource("all");
    setOwner("all");
    setFromDate(undefined);
    setToDate(undefined);

    // Reset to page 1
    router.push("/dashboard/crm/leads?page=1", { scroll: false });
  };

  // Apply filters on Enter key for search (immediate)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>
          Use the options below to search and filter leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, email, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-9"
            />
          </div>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Filter Options */}
        <div
          className={cn(
            "grid gap-4",
            isAdmin
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {/* Status Filter */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {LEAD_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Source Filter */}
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="WEBSITE">Website</SelectItem>
              <SelectItem value="REFERRAL">Referral</SelectItem>
              <SelectItem value="ADMIN">Admin Import</SelectItem>
              <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
              <SelectItem value="REASSIGNED">Reassigned</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Owner Filter (Admin Only) */}
          {isAdmin && (
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {marketers.map((marketer) => (
                  <SelectItem key={marketer.id} value={marketer.id}>
                    {marketer.full_name || "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* From Date Picker */}
          <Popover
            open={isFromDatePickerOpen}
            onOpenChange={setIsFromDatePickerOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fromDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fromDate ? format(fromDate, "dd MMM, yyyy") : "From Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={(selectedDate) => {
                  setFromDate(selectedDate);
                  setIsFromDatePickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* To Date Picker */}
          <Popover
            open={isToDatePickerOpen}
            onOpenChange={setIsToDatePickerOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !toDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {toDate ? format(toDate, "dd MMM, yyyy") : "To Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={(selectedDate) => {
                  setToDate(selectedDate);
                  setIsToDatePickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
