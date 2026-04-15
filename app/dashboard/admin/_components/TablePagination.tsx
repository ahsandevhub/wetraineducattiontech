"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  pageSizeOptions?: number[];
};

export default function TablePagination({
  currentPage,
  totalPages,
  rowsPerPage,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  pageSizeOptions = [10, 25, 50],
}: TablePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const fromRow = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const toRow =
    totalRows === 0 ? 0 : Math.min(currentPage * rowsPerPage, totalRows);

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Rows per page:</span>
        <Select
          value={String(rowsPerPage)}
          onValueChange={(value) => onRowsPerPageChange(parseInt(value))}
        >
          <SelectTrigger className="h-8 w-[90px]">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600">
          Showing {fromRow}-{toRow} of {totalRows}
        </span>

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm text-gray-600 px-2">
          Page {currentPage} of {safeTotalPages}
        </span>

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === safeTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === safeTotalPages}
          onClick={() => onPageChange(safeTotalPages)}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
