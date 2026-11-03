import type { EntryListParams, LookupType } from "../types";

export const entryKeys = {
  all: ["checkpoint-entries"] as const,
  lists: () => [...entryKeys.all, "list"] as const,
  list: (params: EntryListParams) => [...entryKeys.lists(), params] as const,
  detail: (id: string) => [...entryKeys.all, "detail", id] as const,
};

export const lookupKeys = {
  byType: (type: LookupType) => ["lookup", type] as const,
};
