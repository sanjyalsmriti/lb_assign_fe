import Link from "next/link";
import { formatDateTime, formatNumber } from "@/lib/format";
import type { CheckpointEntry } from "../types";
import type { EntryAction } from "./entry-action-dialog";
import { EntryRowActions } from "./entry-row-actions";
import { EntryStatusBadge } from "./entry-status-badge";

interface EntryCardProps {
  entry: CheckpointEntry;
  onAction: (entry: CheckpointEntry, action: EntryAction) => void;
}

export function EntryCard({ entry, onAction }: EntryCardProps) {
  return (
    <article className="h-full rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/checkpoint-entries/${entry.id}`}
            className="font-medium text-primary hover:underline"
          >
            {entry.entryNo}
          </Link>
          <p className="mt-0.5 text-sm font-medium">{entry.vehicleNo}</p>
        </div>
        <div className="flex items-center gap-1">
          <EntryStatusBadge status={entry.status} />
          <EntryRowActions entry={entry} onAction={onAction} />
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Driver</dt>
          <dd className="truncate">{entry.driverName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Load</dt>
          <dd className="truncate">
            {entry.productName} · {formatNumber(entry.quantity)} MT
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Checkpoint</dt>
          <dd className="truncate">{entry.checkpointName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Arrived</dt>
          <dd>{formatDateTime(entry.arrivedAt)}</dd>
        </div>
      </dl>
    </article>
  );
}
