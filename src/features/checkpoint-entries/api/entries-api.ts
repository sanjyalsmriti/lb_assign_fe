import { http } from "@/lib/http";
import type { ItemResponse, LookupOption, PaginatedResponse } from "@/types/api";
import type { EntryInput } from "../schemas/entry-schema";
import type {
  CheckpointEntry,
  EntryListParams,
  LookupType,
  StatusChangeRequest,
  VoidRequest,
} from "../types";

const BASE = "/checkpoint-entries";

function toSearchParams(params: EntryListParams) {
  const query: Record<string, string> = {
    page: String(params.page),
    pageSize: String(params.pageSize),
    sort: `${params.sortBy}:${params.sortDir}`,
  };
  if (params.search) query.search = params.search;
  if (params.status.length) query.status = params.status.join(",");
  if (params.checkpointId) query.checkpointId = params.checkpointId;
  if (params.vehicleTypeId) query.vehicleTypeId = params.vehicleTypeId;
  if (params.purpose) query.purpose = params.purpose;
  if (params.from) query.from = params.from;
  if (params.to) query.to = params.to;
  return query;
}

export async function fetchEntries(params: EntryListParams) {
  const { data } = await http.get<PaginatedResponse<CheckpointEntry>>(BASE, {
    params: toSearchParams(params),
  });
  return data;
}

export async function fetchEntry(id: string) {
  const { data } = await http.get<ItemResponse<CheckpointEntry>>(`${BASE}/${id}`);
  return data.data;
}

export async function createEntry(input: EntryInput) {
  const { data } = await http.post<ItemResponse<CheckpointEntry>>(BASE, input);
  return data.data;
}

export async function updateEntry(id: string, input: EntryInput) {
  const { data } = await http.patch<ItemResponse<CheckpointEntry>>(`${BASE}/${id}`, input);
  return data.data;
}

export async function changeEntryStatus(id: string, body: StatusChangeRequest) {
  const { data } = await http.patch<ItemResponse<CheckpointEntry>>(`${BASE}/${id}/status`, body);
  return data.data;
}

export async function voidEntry(id: string, body: VoidRequest) {
  const { data } = await http.delete<ItemResponse<CheckpointEntry>>(`${BASE}/${id}`, {
    data: body,
  });
  return data.data;
}

export async function fetchLookup(type: LookupType) {
  const { data } = await http.get<ItemResponse<LookupOption[]>>(`/lookup/${type}`);
  return data.data;
}
