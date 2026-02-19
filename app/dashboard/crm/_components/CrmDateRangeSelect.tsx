/**
 * CRM Date Range Selector
 * Dropdown to select date range with URL parameter persistence
 * No scroll on change
 */

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { CrmRangeKey, getCrmRangeOptions } from "../lib/date-range";

interface CrmDateRangeSelectProps {
  currentRange?: CrmRangeKey;
}

export function CrmDateRangeSelect({
  currentRange = "this_month",
}: CrmDateRangeSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const options = getCrmRangeOptions();

  const handleRangeChange = (newRange: string) => {
    // Preserve existing parameters
    const params = new URLSearchParams(searchParams);
    params.set("range", newRange);
    params.set("page", "1"); // Reset pagination when range changes

    // Update URL without scrolling to top
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-slate-700">Date Range:</label>
      <Select value={currentRange} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
