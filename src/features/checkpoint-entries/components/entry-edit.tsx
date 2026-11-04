"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { getErrorMessage } from "@/lib/api-error";
import { toLocalInputValue } from "@/lib/format";
import { canEdit, STATUS_CONFIG } from "../constants";
import { useEntry, useUpdateEntry } from "../hooks/use-entries";
import { useEntryLookups } from "../hooks/use-entry-lookups";
import { EntryForm } from "./entry-form";
import { EntryFormSkeleton } from "./entry-form-skeleton";

export function EntryEdit({ id }: { id: string }) {
  const router = useRouter();
  const entryQuery = useEntry(id);
  const lookups = useEntryLookups();
  const updateEntry = useUpdateEntry(id);
  const entry = entryQuery.data;

  const breadcrumbs = [
    { label: "Checkpoint", href: "/checkpoint-entries" },
    { label: "Entries", href: "/checkpoint-entries" },
    { label: entry?.entryNo ?? "Entry", href: `/checkpoint-entries/${id}` },
    { label: "Edit" },
  ];

  let content: React.ReactNode;

  if (entryQuery.isError || lookups.isError) {
    const error = entryQuery.error ?? lookups.error;
    content = (
      <ErrorState
        title="Couldn't load this entry"
        message={getErrorMessage(error)}
        onRetry={() => {
          if (entryQuery.isError) entryQuery.refetch();
          lookups.refetch();
        }}
        retrying={entryQuery.isFetching || lookups.isFetching}
      />
    );
  } else if (!entry || !lookups.data) {
    content = <EntryFormSkeleton />;
  } else if (!canEdit(entry.status)) {
    content = (
      <div className="rounded-xl border bg-card">
        <EmptyState
          icon={Lock}
          title="This entry can't be edited"
          description={`Only entries waiting for verification can be changed. This one is ${STATUS_CONFIG[entry.status].label.toLowerCase()}.`}
          action={
            <Link href={`/checkpoint-entries/${id}`} className={buttonVariants({ variant: "outline" })}>
              <ArrowLeft />
              Back to entry
            </Link>
          }
        />
      </div>
    );
  } else {
    content = (
      <EntryForm
        key={entry.updatedAt}
        lookups={lookups.data}
        submitLabel="Save changes"
        cancelHref={`/checkpoint-entries/${id}`}
        requireChanges
        defaultValues={{
          vehicleNo: entry.vehicleNo,
          vehicleTypeId: entry.vehicleTypeId,
          driverName: entry.driverName,
          driverPhone: entry.driverPhone,
          licenseNo: entry.licenseNo,
          transporterId: entry.transporterId,
          checkpointId: entry.checkpointId,
          productId: entry.productId,
          purpose: entry.purpose,
          quantity: entry.quantity,
          challanNo: entry.challanNo,
          arrivedAt: toLocalInputValue(entry.arrivedAt),
          remarks: entry.remarks,
        }}
        onSubmit={async (input) => {
          const updated = await updateEntry.mutateAsync(input);
          toast.success("Changes saved", { description: updated.entryNo });
          router.push(`/checkpoint-entries/${id}`);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title={entry ? `Edit ${entry.entryNo}` : "Edit entry"}
        description="Correct details before the entry is verified."
        breadcrumbs={breadcrumbs}
      />
      {content}
    </div>
  );
}
