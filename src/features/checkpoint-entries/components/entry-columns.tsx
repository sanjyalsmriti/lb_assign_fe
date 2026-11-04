import Link from "next/link";
import { columnHelper } from "@/components/data-table/data-table";
import { formatDateTime, formatNumber } from "@/lib/format";
import type { CheckpointEntry } from "../types";
import type { EntryAction } from "./entry-action-dialog";
import { EntryRowActions } from "./entry-row-actions";
import { EntryStatusBadge } from "./entry-status-badge";

const col = columnHelper<CheckpointEntry>();

export function getEntryColumns(onAction: (entry: CheckpointEntry, action: EntryAction) => void) {
  return col.columns([
    col.accessor("entryNo", {
      header: "Entry No",
      cell: ({ row }) => (
        <div>
          <Link
            href={`/checkpoint-entries/${row.original.id}`}
            className="font-medium text-primary hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {row.original.entryNo}
          </Link>
          {row.original.tokenNo && (
            <p className="text-xs text-muted-foreground">Token {row.original.tokenNo}</p>
          )}
        </div>
      ),
    }),
    col.accessor("vehicleNo", {
      header: "Vehicle",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.vehicleNo}</p>
          <p className="text-xs text-muted-foreground">{row.original.vehicleTypeName}</p>
        </div>
      ),
    }),
    col.display({
      id: "driver",
      header: "Driver",
      cell: ({ row }) => (
        <div>
          <p>{row.original.driverName}</p>
          <p className="text-xs text-muted-foreground">{row.original.driverPhone}</p>
        </div>
      ),
    }),
    col.accessor("quantity", {
      header: "Load",
      cell: ({ row }) => (
        <div>
          <p>{row.original.productName}</p>
          <p className="text-xs text-muted-foreground">{formatNumber(row.original.quantity)} MT</p>
        </div>
      ),
    }),
    col.display({
      id: "checkpoint",
      header: "Checkpoint",
      cell: ({ row }) => (
        <span className="block max-w-44 truncate" title={row.original.checkpointName}>
          {row.original.checkpointName}
        </span>
      ),
    }),
    col.accessor("arrivedAt", {
      header: "Arrived",
      sortDescFirst: true,
      cell: ({ getValue }) => <span className="text-muted-foreground">{formatDateTime(getValue())}</span>,
    }),
    col.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => <EntryStatusBadge status={getValue()} />,
    }),
    col.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <EntryRowActions entry={row.original} onAction={onAction} />
        </div>
      ),
    }),
  ]);
}
