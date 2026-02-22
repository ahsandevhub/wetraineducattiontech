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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  type Column,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: unknown) => void;
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (newPage: number) => void;
  isExternalPagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  currentPage = 0,
  pageSize = 25,
  totalCount,
  onPageChange,
  isExternalPagination = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // For external pagination, we show all passed data on the current page
  // For internal pagination, we use TanStack's pagination
  const tablePageSize = isExternalPagination ? data.length : pageSize;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isExternalPagination
      ? undefined
      : getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: tablePageSize,
      },
    },
  });

  const internalPageIndex = isExternalPagination
    ? 0
    : table.getState().pagination.pageIndex;
  const internalPageSize = isExternalPagination
    ? data.length
    : table.getState().pagination.pageSize;

  // For external pagination
  const externalPageIndex = currentPage - 1; // Convert 1-based to 0-based
  const externalTotalRows = totalCount ?? 0;
  const externalPageCount = Math.ceil(externalTotalRows / pageSize) || 1;
  const externalStartRow =
    externalTotalRows === 0 ? 0 : externalPageIndex * pageSize + 1;
  const externalEndRow = Math.min(
    (externalPageIndex + 1) * pageSize,
    externalTotalRows,
  );

  // For internal pagination
  const internalPageIndex_display = internalPageIndex;
  const internalTotalRows = table.getFilteredRowModel().rows.length;
  const internalStartRow =
    internalTotalRows === 0 ? 0 : internalPageIndex * internalPageSize + 1;
  const internalEndRow = Math.min(
    (internalPageIndex + 1) * internalPageSize,
    internalTotalRows,
  );

  // Choose which to display
  const isUsingExternal = isExternalPagination && totalCount !== undefined;
  const displayStartRow = isUsingExternal ? externalStartRow : internalStartRow;
  const displayEndRow = isUsingExternal ? externalEndRow : internalEndRow;
  const displayTotalRows = isUsingExternal
    ? externalTotalRows
    : internalTotalRows;
  const displayPageCount = isUsingExternal
    ? externalPageCount
    : table.getPageCount();
  const displayPageIndex = isUsingExternal
    ? externalPageIndex
    : internalPageIndex_display;

  return (
    <div className="space-y-4">
      {/* Search handled by page-level filters; DataTable no longer renders a search input */}

      <div className="rounded-md border bg-white">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[900px] w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="first:pl-5 py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-slate-50"
                    onClick={() => onRowClick?.(row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="first:pl-5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <p>
            Showing{" "}
            <span className="font-medium text-slate-900">
              {displayStartRow}-{displayEndRow}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-900">
              {displayTotalRows.toLocaleString()}
            </span>{" "}
            {displayTotalRows === 1 ? "result" : "results"}
          </p>
          {!isUsingExternal && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Show:</span>
              <Select
                value={(isUsingExternal
                  ? pageSize
                  : internalPageSize
                ).toString()}
                onValueChange={(value) => {
                  if (!isUsingExternal) {
                    table.setPageSize(Number(value));
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100, 250, 500].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isUsingExternal && onPageChange) {
                onPageChange(1);
              } else {
                table.setPageIndex(0);
              }
            }}
            disabled={
              isUsingExternal
                ? displayPageIndex === 0
                : !table.getCanPreviousPage()
            }
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isUsingExternal && onPageChange) {
                onPageChange(Math.max(1, currentPage - 1));
              } else {
                table.previousPage();
              }
            }}
            disabled={
              isUsingExternal
                ? displayPageIndex === 0
                : !table.getCanPreviousPage()
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-slate-600 min-w-[100px] text-center">
            Page {isUsingExternal ? currentPage : displayPageIndex + 1} of{" "}
            {displayPageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isUsingExternal && onPageChange) {
                onPageChange(currentPage + 1);
              } else {
                table.nextPage();
              }
            }}
            disabled={
              isUsingExternal
                ? displayPageIndex >= displayPageCount - 1
                : !table.getCanNextPage()
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (isUsingExternal && onPageChange) {
                onPageChange(displayPageCount);
              } else {
                table.setPageIndex(table.getPageCount() - 1);
              }
            }}
            disabled={
              isUsingExternal
                ? displayPageIndex >= displayPageCount - 1
                : !table.getCanNextPage()
            }
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper component for sortable column headers
export function SortableHeader<TData, TValue>({
  column,
  children,
}: {
  column: Column<TData, TValue>;
  children: React.ReactNode;
}) {
  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="-ml-4 h-8 data-[state=open]:bg-slate-100"
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}
