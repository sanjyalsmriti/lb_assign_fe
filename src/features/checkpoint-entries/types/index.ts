import type { LookupOption } from "@/types/api";

export const ENTRY_STATUSES = ["arrived", "verified", "rejected", "exited", "voided"] as const;
export type EntryStatus = (typeof ENTRY_STATUSES)[number];

export const PURPOSES = ["loading", "unloading"] as const;
export type Purpose = (typeof PURPOSES)[number];

export type StatusAction = "verify" | "reject" | "exit";

export interface StatusEvent {
  status: EntryStatus;
  at: string;
  by: string;
  note?: string;
}

export interface CheckpointEntry {
  id: string;
  entryNo: string;
  tokenNo: string | null;
  vehicleNo: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  driverName: string;
  driverPhone: string;
  licenseNo: string;
  transporterId: string;
  transporterName: string;
  checkpointId: string;
  checkpointName: string;
  productId: string;
  productName: string;
  purpose: Purpose;
  quantity: number;
  challanNo: string;
  remarks: string;
  arrivedAt: string;
  status: EntryStatus;
  statusReason: string | null;
  history: StatusEvent[];
  createdAt: string;
  updatedAt: string;
}

export type SortDirection = "asc" | "desc";
export const SORTABLE_FIELDS = ["entryNo", "vehicleNo", "quantity", "arrivedAt", "status"] as const;
export type SortField = (typeof SORTABLE_FIELDS)[number];

export interface EntryListParams {
  page: number;
  pageSize: number;
  search: string;
  status: EntryStatus[];
  checkpointId: string;
  vehicleTypeId: string;
  purpose: Purpose | "";
  from: string;
  to: string;
  sortBy: SortField;
  sortDir: SortDirection;
}

export interface StatusChangeRequest {
  action: StatusAction;
  reason?: string;
}

export interface VoidRequest {
  reason: string;
}

export type LookupType = "checkpoints" | "transporters" | "products" | "vehicle-types";

export interface EntryLookups {
  checkpoints: LookupOption[];
  transporters: LookupOption[];
  products: LookupOption[];
  vehicleTypes: LookupOption[];
}
