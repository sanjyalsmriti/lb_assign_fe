"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { getErrorMessage } from "@/lib/api-error";
import { toLocalInputValue } from "@/lib/format";
import { useCreateEntry } from "../hooks/use-entries";
import { useEntryLookups } from "../hooks/use-entry-lookups";
import { EntryForm } from "./entry-form";
import { EntryFormSkeleton } from "./entry-form-skeleton";

export function EntryCreate() {
  const router = useRouter();
  const lookups = useEntryLookups();
  const createEntry = useCreateEntry();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="New checkpoint entry"
        description="Register a vehicle that has arrived at the gate."
        breadcrumbs={[
          { label: "Checkpoint", href: "/checkpoint-entries" },
          { label: "Entries", href: "/checkpoint-entries" },
          { label: "New entry" },
        ]}
      />

      {lookups.data ? (
        <EntryForm
          lookups={lookups.data}
          submitLabel="Create entry"
          cancelHref="/checkpoint-entries"
          defaultValues={{
            vehicleNo: "",
            vehicleTypeId: "",
            driverName: "",
            driverPhone: "",
            licenseNo: "",
            transporterId: "",
            checkpointId: "",
            productId: "",
            purpose: "loading",
            challanNo: "",
            arrivedAt: toLocalInputValue(new Date().toISOString()),
            remarks: "",
          }}
          onSubmit={async (input) => {
            const entry = await createEntry.mutateAsync(input);
            toast.success("Entry created", { description: `${entry.entryNo} · ${entry.vehicleNo}` });
            router.push(`/checkpoint-entries/${entry.id}`);
          }}
        />
      ) : lookups.isError ? (
        <ErrorState
          title="Couldn't load form options"
          message={getErrorMessage(lookups.error)}
          onRetry={lookups.refetch}
          retrying={lookups.isFetching}
        />
      ) : (
        <EntryFormSkeleton />
      )}
    </div>
  );
}
