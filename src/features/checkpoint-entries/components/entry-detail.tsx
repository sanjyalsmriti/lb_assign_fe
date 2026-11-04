"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Ban, CheckCircle2, FileQuestion, LogOut, Pencil, XCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { ApiError, getErrorMessage } from "@/lib/api-error";
import { formatDateTime, formatNumber } from "@/lib/format";
import { canApply, canEdit, canVoid, PURPOSE_LABELS, STATUS_CONFIG } from "../constants";
import { useEntry } from "../hooks/use-entries";
import type { CheckpointEntry } from "../types";
import { EntryActionDialog, type EntryAction, type PendingAction } from "./entry-action-dialog";
import { EntryStatusBadge } from "./entry-status-badge";

const BREADCRUMB_ROOT = [
  { label: "Checkpoint", href: "/checkpoint-entries" },
  { label: "Entries", href: "/checkpoint-entries" },
];

export function EntryDetail({ id }: { id: string }) {
  const { data: entry, isPending, isError, error, refetch, isFetching } = useEntry(id);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  if (isPending) return <DetailSkeleton />;

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <div className="space-y-5">
          <PageHeader title="Entry not found" breadcrumbs={[...BREADCRUMB_ROOT, { label: "Not found" }]} />
          <div className="rounded-xl border bg-card">
            <EmptyState
              icon={FileQuestion}
              title="This entry doesn't exist"
              description="It may have been removed, or the link is wrong."
              action={
                <Link href="/checkpoint-entries" className={buttonVariants({ variant: "outline" })}>
                  <ArrowLeft />
                  Back to entries
                </Link>
              }
            />
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-5">
        <PageHeader title="Entry details" breadcrumbs={[...BREADCRUMB_ROOT, { label: "Details" }]} />
        <ErrorState
          title="Couldn't load this entry"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      </div>
    );
  }

  const openAction = (action: EntryAction) => setPendingAction({ entry, action });

  return (
    <div className="space-y-5">
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {entry.entryNo}
            <EntryStatusBadge status={entry.status} />
          </span>
        }
        description={`${entry.vehicleNo} · arrived ${formatDateTime(entry.arrivedAt)} at ${entry.checkpointName}`}
        breadcrumbs={[...BREADCRUMB_ROOT, { label: entry.entryNo }]}
        actions={<DetailActions entry={entry} onAction={openAction} />}
      />

      {entry.statusReason && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="note"
        >
          <span className="font-medium">{STATUS_CONFIG[entry.status].label} reason:</span>{" "}
          {entry.statusReason}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="grid gap-5 lg:col-span-2 md:grid-cols-2">
          <InfoCard
            title="Vehicle & driver"
            items={[
              ["Vehicle no", entry.vehicleNo],
              ["Vehicle type", entry.vehicleTypeName],
              ["Driver", entry.driverName],
              ["Phone", <a key="phone" href={`tel:${entry.driverPhone}`} className="text-primary hover:underline">{entry.driverPhone}</a>],
              ["License no", entry.licenseNo],
            ]}
          />
          <InfoCard
            title="Load"
            items={[
              ["Product", entry.productName],
              ["Quantity", `${formatNumber(entry.quantity)} MT`],
              ["Purpose", PURPOSE_LABELS[entry.purpose]],
              ["Transporter", entry.transporterName],
              ["Challan no", entry.challanNo || "—"],
            ]}
          />
          <InfoCard
            className="md:col-span-2"
            title="Checkpoint"
            items={[
              ["Checkpoint", entry.checkpointName],
              ["Arrived at", formatDateTime(entry.arrivedAt)],
              ["Queue token", entry.tokenNo ?? "Not issued"],
              ["Last updated", formatDateTime(entry.updatedAt)],
              ["Remarks", entry.remarks || "—"],
            ]}
          />
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-5 border-l pl-5">
              {[...entry.history].reverse().map((event, index) => (
                <li key={`${event.status}-${index}`} className="relative">
                  <span className="absolute top-1 -left-[25px] size-2.5 rounded-full border-2 border-background bg-primary ring-1 ring-primary/30" />
                  <div className="flex flex-wrap items-center gap-2">
                    <EntryStatusBadge status={event.status} />
                    <time className="text-xs text-muted-foreground" dateTime={event.at}>
                      {formatDateTime(event.at)}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">by {event.by}</p>
                  {event.note && <p className="mt-0.5 text-sm">{event.note}</p>}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <EntryActionDialog pending={pendingAction} onClose={() => setPendingAction(null)} />
    </div>
  );
}

function DetailActions({
  entry,
  onAction,
}: {
  entry: CheckpointEntry;
  onAction: (action: EntryAction) => void;
}) {
  const { status } = entry;
  return (
    <>
      {canEdit(status) && (
        <Link href={`/checkpoint-entries/${entry.id}/edit`} className={buttonVariants({ variant: "outline" })}>
          <Pencil />
          Edit
        </Link>
      )}
      {canVoid(status) && (
        <Button variant="outline" className="text-destructive" onClick={() => onAction("void")}>
          <Ban />
          Void
        </Button>
      )}
      {canApply("reject", status) && (
        <Button variant="destructive" onClick={() => onAction("reject")}>
          <XCircle />
          Reject
        </Button>
      )}
      {canApply("verify", status) && (
        <Button onClick={() => onAction("verify")}>
          <CheckCircle2 />
          Verify
        </Button>
      )}
      {canApply("exit", status) && (
        <Button onClick={() => onAction("exit")}>
          <LogOut />
          Mark exit
        </Button>
      )}
    </>
  );
}

function InfoCard({
  title,
  items,
  className,
}: {
  title: string;
  items: [string, React.ReactNode][];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {items.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-0.5 text-sm font-medium break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading entry">
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="grid gap-5 lg:col-span-2 md:grid-cols-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={`space-y-4 rounded-xl border bg-card p-4 ${i === 2 ? "md:col-span-2" : ""}`}>
              <Skeleton className="h-4 w-32" />
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }, (_, j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
