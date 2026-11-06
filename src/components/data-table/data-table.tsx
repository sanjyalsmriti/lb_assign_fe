"use client";

import {
  createColumnHelper,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const features = tableFeatures({ rowSortingFeature });

export type TableFeatures = typeof features;
export type DataTableColumn<T extends RowData, TValue = unknown> = ColumnDef<TableFeatures, T, TValue>;

export function columnHelper<T extends RowData>() {
  return createColumnHelper<TableFeatures, T>();
}

interface DataTableProps<T extends RowData> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  skeletonRows?: number;
  emptyState?: React.ReactNode;
  renderMobileCard?: (row: T) => React.ReactNode;
  caption?: string;
}

export function DataTable<T extends RowData>({
  columns,
  data,
  getRowId,
  sorting,
  onSortingChange,
  isLoading,
  isFetching,
  skeletonRows = 8,
  emptyState,
  renderMobileCard,
  caption,
}: DataTableProps<T>) {
  const table = useTable({
    features,
    columns,
    data,
    getRowId,
    state: { sorting },
    onSortingChange: (updater: Updater<SortingState>) =>
      onSortingChange(typeof updater === "function" ? updater(sorting) : updater),
    manualSorting: true,
    enableMultiSort: false,
    enableSortingRemoval: false,
  });

  const rows = table.getRowModel().rows;
  const showEmpty = !isLoading && rows.length === 0;

  return (
    <div className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}>
      <div className={cn("rounded-xl border bg-card", renderMobileCard && "hidden lg:block")}>
        <Table aria-busy={isLoading || isFetching}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const content = header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  );

                  return (
                    <TableHead
                      key={header.id}
                      className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase"
                      aria-sort={
                        sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined
                      }
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 uppercase hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          {content}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        content
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: skeletonRows }, (_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="px-3 py-3">
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading &&
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2.5">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {showEmpty && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {renderMobileCard && (
        <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
          {isLoading &&
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-3 rounded-xl border bg-card p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          {!isLoading && rows.map((row) => <div key={row.id}>{renderMobileCard(row.original)}</div>)}
          {showEmpty && <div className="rounded-xl border bg-card sm:col-span-2">{emptyState}</div>}
        </div>
      )}
    </div>
  );
}
