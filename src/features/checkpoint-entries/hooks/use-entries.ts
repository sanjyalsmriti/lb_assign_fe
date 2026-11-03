import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeEntryStatus,
  createEntry,
  fetchEntries,
  fetchEntry,
  fetchLookup,
  updateEntry,
  voidEntry,
} from "../api/entries-api";
import { entryKeys, lookupKeys } from "../api/query-keys";
import type { EntryInput } from "../schemas/entry-schema";
import type { CheckpointEntry, EntryListParams, LookupType, StatusChangeRequest } from "../types";

export function useEntries(params: EntryListParams) {
  return useQuery({
    queryKey: entryKeys.list(params),
    queryFn: () => fetchEntries(params),
    placeholderData: keepPreviousData,
  });
}

export function useEntry(id: string) {
  return useQuery({
    queryKey: entryKeys.detail(id),
    queryFn: () => fetchEntry(id),
  });
}

export function useLookup(type: LookupType) {
  return useQuery({
    queryKey: lookupKeys.byType(type),
    queryFn: () => fetchLookup(type),
    staleTime: Infinity,
  });
}

function useSyncEntry() {
  const queryClient = useQueryClient();

  return (entry: CheckpointEntry) => {
    queryClient.setQueryData(entryKeys.detail(entry.id), entry);
    return queryClient.invalidateQueries({ queryKey: entryKeys.lists() });
  };
}

export function useCreateEntry() {
  const syncEntry = useSyncEntry();
  return useMutation({
    mutationFn: (input: EntryInput) => createEntry(input),
    onSuccess: syncEntry,
  });
}

export function useUpdateEntry(id: string) {
  const syncEntry = useSyncEntry();
  return useMutation({
    mutationFn: (input: EntryInput) => updateEntry(id, input),
    onSuccess: syncEntry,
  });
}

export function useChangeEntryStatus() {
  const syncEntry = useSyncEntry();
  return useMutation({
    mutationFn: ({ id, ...body }: StatusChangeRequest & { id: string }) =>
      changeEntryStatus(id, body),
    onSuccess: syncEntry,
  });
}

export function useVoidEntry() {
  const syncEntry = useSyncEntry();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => voidEntry(id, { reason }),
    onSuccess: syncEntry,
  });
}
