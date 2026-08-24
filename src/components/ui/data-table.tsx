'use client';

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type DataTableFilterOption = {
  columnId: string;
  label: string;
  options: { label: string; value: string }[];
};

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  className?: string;
  searchPlaceholder?: string;
  filters?: DataTableFilterOption[];
  pageSizeOptions?: number[];
  initialPageSize?: number;
};

function visiblePageIndexes(pageIndex: number, pageCount: number, windowSize = 5): number[] {
  const count = Math.max(pageCount, 1);
  if (count <= windowSize) {
    return Array.from({ length: count }, (_, i) => i);
  }
  const half = Math.floor(windowSize / 2);
  let start = Math.max(0, pageIndex - half);
  const end = Math.min(count, start + windowSize);
  start = Math.max(0, end - windowSize);
  return Array.from({ length: end - start }, (_, i) => start + i);
}

function columnLabel(columnId: string): string {
  if (columnId === 'select') return '';
  return columnId
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase());
}

function createSelectColumn<TData, TValue>(): ColumnDef<TData, TValue> {
  return {
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = 'No results.',
  className,
  searchPlaceholder = 'Search…',
  filters = [],
  pageSizeOptions = [5, 10, 20],
  initialPageSize = 5,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const columnsWithSelect = useMemo(
    () => [createSelectColumn<TData, TValue>(), ...columns],
    [columns],
  );

  const table = useReactTable({
    data,
    columns: columnsWithSelect,
    state: {
      sorting,
      rowSelection,
      globalFilter,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [globalFilter, columnFilters, data]);

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const hasActiveFilters =
    Boolean(globalFilter) || columnFilters.some((f) => f.value !== undefined && f.value !== '');

  function clearFilters() {
    setGlobalFilter('');
    setColumnFilters([]);
  }

  function getFilterValue(columnId: string): string {
    const found = columnFilters.find((f) => f.id === columnId);
    return typeof found?.value === 'string' ? found.value : '';
  }

  function setFilterValue(columnId: string, value: string) {
    setColumnFilters((prev) => {
      const without = prev.filter((f) => f.id !== columnId);
      if (!value || value === '__all__') return without;
      return [...without, { id: columnId, value }];
    });
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-3 px-4 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-8"
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.columnId}
            value={getFilterValue(filter.columnId) || '__all__'}
            onValueChange={(value) => setFilterValue(filter.columnId, value)}
          >
            <SelectTrigger className="h-9 w-full sm:w-[160px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All {filter.label.toLowerCase()}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {(selectedCount > 0 || filteredCount !== data.length) && (
        <div className="flex items-center justify-between px-4 text-xs text-muted-foreground">
          <span>
            {selectedCount > 0
              ? `${selectedCount} of ${filteredCount} row(s) selected`
              : `${filteredCount} result${filteredCount === 1 ? '' : 's'}`}
          </span>
          {selectedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => table.resetRowSelection()}
            >
              Clear selection
            </Button>
          )}
        </div>
      )}

      <div className="space-y-3 px-4 md:hidden">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="space-y-2 rounded-lg border bg-card p-3"
              data-state={row.getIsSelected() && 'selected'}
            >
              {row.getVisibleCells().map((cell) =>
                cell.column.id === 'select' ? (
                  <div key={cell.id} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Select</span>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ) : (
                  <div key={cell.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">
                      {columnLabel(cell.column.id)}
                    </span>
                    <div className="min-w-0 text-right">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                ),
              )}
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.id === 'select' ? 'w-10 px-3' : undefined}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === 'select' ? 'px-3' : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columnsWithSelect.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <span className="text-center sm:text-left">
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {Math.max(pageCount, 1)} ({filteredCount}{' '}
          items)
        </span>
        <div className="flex flex-wrap items-center justify-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {visiblePageIndexes(pageIndex, pageCount).map((p) => (
            <Button
              key={p}
              variant={p === pageIndex ? 'default' : 'outline'}
              size="sm"
              className="h-7 min-w-7 px-2"
              disabled={pageCount === 0}
              onClick={() => table.setPageIndex(p)}
            >
              {p + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2 sm:justify-end">
          <span>Page size</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function SortableHeader({
  column,
  title,
  className,
}: {
  column: {
    getIsSorted: () => false | 'asc' | 'desc';
    toggleSorting: (desc?: boolean) => void;
  };
  title: string;
  className?: string;
}) {
  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        '-ml-3 h-8 gap-1 px-2 font-medium text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {title}
      {sorted === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
      )}
    </Button>
  );
}
