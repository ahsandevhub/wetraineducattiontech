/**
 * HRM Data Table Toolbar
 * Consistent toolbar layout for all HRM tables
 * Search on left, filters/actions on right
 */

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ReactNode } from "react";

type DataTableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode; // For filters and action buttons
};

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters and Actions */}
      {children && (
        <div className="flex flex-wrap gap-2 items-center">{children}</div>
      )}
    </div>
  );
}
