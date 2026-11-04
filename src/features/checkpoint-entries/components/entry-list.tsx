"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, SearchX } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/data-table/pagination";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { getErrorMessage } from "@/lib/api-error";
import { PAGE_SIZES } from "../constants";
import { useEntries } from "../hooks/use-entries";
import { useEntryListParams } from "../hooks/use-entry-list-params";
import type { CheckpointEntry, SortField } from "../types";
import { EntryActionDialog, type EntryAction, type PendingAction } from "./entry-action-dialog";
import { EntryCard } from "./entry-card";
import { getEntryColumns } from "./entry-columns";
import { EntryFilters } from "./entry-filters";

export function EntryList() {
  const { params, setParams, resetFilters, hasActiveFilters } = useEntryListParams();
  const { data, isPending, isFetching, isError, error, refetch } = useEntries(params);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const onAction = (entry: CheckpointEntry, action: EntryAction) => setPendingAction({ entry, action });
  const columns = useMemo(() => getEntryColumns(onAction), []);
  const sorting = useMemo(
    () => [{ id: params.sortBy, desc: params.sortDir === "desc" }],
    [params.sortBy, params.sortDir],
  );

  // e.g. a bookmarked ?page=9 that no longer exists after entries were voided
  const lastPage = data?.meta.totalPages ?? 1;
  const pageOutOfRange = Boolean(data && data.data.length === 0 && data.meta.total > 0);
  useEffect(() => {
    if (pageOutOfRange) setParams({ page: lastPage });
  }, [pageOutOfRange, lastPage, setParams]);

  const emptyState = hasActiveFilters ? (
    <EmptyState
      icon={SearchX}
      title="No matching entries"
      description="Try a different search term or remove some filters."
      action={
        <Button variant="outline" onClick={resetFilters}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      title="No checkpoint entries yet"
      description="Entries will show up here once vehicles are registered at the gate."
      action={
        <Link href="/checkpoint-entries/new" className={buttonVariants()}>
          <Plus />
          New entry
        </Link>
      }
    />
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Checkpoint Entries"
        description="Vehicles registered at the checkpoint gate."
        breadcrumbs={[{ label: "Checkpoint", href: "/checkpoint-entries" }, { label: "Entries" }]}
        actions={
          <Link href="/checkpoint-entries/new" className={buttonVariants()}>
            <Plus />
            New entry
          </Link>
        }
      />

      <EntryFilters
        params={params}
        onChange={setParams}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {isError && !data ? (
        <ErrorState
          title="Couldn't load entries"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : (
        <>
          {isError && (
            <p role="alert" className="text-sm text-destructive">
              Couldn&apos;t refresh the list: {getErrorMessage(error)}{" "}
              <button type="button" className="font-medium underline" onClick={() => refetch()}>
                Retry
              </button>
            </p>
          )}
          <DataTable
            caption="Checkpoint entries"
            columns={columns}
            data={data?.data ?? EMPTY}
            getRowId={(row) => row.id}
            sorting={sorting}
            onSortingChange={(next) => {
              const [first] = next;
              if (first) setParams({ sortBy: first.id as SortField, sortDir: first.desc ? "desc" : "asc" });
            }}
            isLoading={isPending}
            isFetching={isFetching}
            skeletonRows={params.pageSize > 10 ? 10 : params.pageSize}
            emptyState={emptyState}
            renderMobileCard={(entry) => <EntryCard entry={entry} onAction={onAction} />}
          />
          {data && data.meta.total > 0 && (
            <Pagination
              page={data.meta.page}
              pageSize={data.meta.pageSize}
              total={data.meta.total}
              totalPages={data.meta.totalPages}
              pageSizes={PAGE_SIZES}
              onPageChange={(page) => setParams({ page })}
              onPageSizeChange={(pageSize) => setParams({ pageSize })}
            />
          )}
        </>
      )}

      <EntryActionDialog pending={pendingAction} onClose={() => setPendingAction(null)} />
    </div>
  );
}

const EMPTY: CheckpointEntry[] = [];
