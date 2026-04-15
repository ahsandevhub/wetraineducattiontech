"use client";

import { getCrmUserDisplayName } from "@/app/dashboard/crm/lib/user-display";
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
import { useEffect, useRef, useState, useTransition } from "react";

interface LogsFiltersProps {
  creators: { id: string; full_name: string | null; email: string | null }[];
  isAdmin: boolean;
  onPendingChange?: (isPending: boolean) => void;
}

const CONTACT_TYPE_OPTIONS = [
  { value: "CALL", label: "Phone Call" },
  { value: "EMAIL", label: "Email" },
  { value: "MEETING", label: "Meeting" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "NOTE", label: "Note" },
  { value: "OTHER", label: "Other" },
];

export function LogsFilters({
  creators,
  isAdmin,
  onPendingChange,
}: LogsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSyncingFromUrlRef = useRef(true);
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [contactType, setContactType] = useState(
    searchParams.get("type") || "all",
  );
  const [createdBy, setCreatedBy] = useState(
    isAdmin ? searchParams.get("user") || "all" : "all",
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
    contactType !== "all" ||
    createdBy !== "all" ||
    fromDate ||
    toDate;

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setContactType(searchParams.get("type") || "all");
    if (isAdmin) {
      setCreatedBy(searchParams.get("user") || "all");
    } else {
      setCreatedBy("all");
    }

    const dateParam = searchParams.get("from");
    setFromDate(dateParam ? new Date(dateParam + "T00:00:00") : undefined);

    const toDateParam = searchParams.get("to");
    setToDate(toDateParam ? new Date(toDateParam + "T00:00:00") : undefined);

    requestAnimationFrame(() => {
      isSyncingFromUrlRef.current = false;
    });
  }, [searchParams, isAdmin]);

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    params.set("page", "1");

    if (search) params.set("search", search);
    if (contactType && contactType !== "all") params.set("type", contactType);
    if (isAdmin && createdBy && createdBy !== "all") {
      params.set("user", createdBy);
    }
    if (fromDate) params.set("from", format(fromDate, "yyyy-MM-dd"));
    if (toDate) params.set("to", format(toDate, "yyyy-MM-dd"));

    startTransition(() => {
      router.push(`/dashboard/crm/logs?${params.toString()}`, {
        scroll: false,
      });
    });
  };

  useEffect(() => {
    if (isSyncingFromUrlRef.current) return;
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactType, createdBy, fromDate, toDate]);

  useEffect(() => {
    if (isSyncingFromUrlRef.current) return;

    const debounceTimer = setTimeout(() => {
      applyFilters();
    }, 500);

    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const clearFilters = () => {
    setSearch("");
    setContactType("all");
    setCreatedBy("all");
    setFromDate(undefined);
    setToDate(undefined);

    startTransition(() => {
      router.push("/dashboard/crm/logs?page=1", { scroll: false });
    });
  };

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
          Use the options below to search and filter contact logs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by lead name, phone, or company..."
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

        <div
          className={cn(
            "grid gap-4",
            isAdmin
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          )}
        >
          <Select value={contactType} onValueChange={setContactType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Contact Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {CONTACT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isAdmin && (
            <Select value={createdBy} onValueChange={setCreatedBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Created By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
                {creators.map((creator) => (
                  <SelectItem key={creator.id} value={creator.id}>
                    {getCrmUserDisplayName(creator)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

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
