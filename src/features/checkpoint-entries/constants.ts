import type { StatusTone } from "@/components/status/status-badge";
import type { EntryListParams, EntryStatus, Purpose, StatusAction } from "./types";

export const STATUS_CONFIG: Record<EntryStatus, { label: string; tone: StatusTone }> = {
  arrived: { label: "Arrived", tone: "info" },
  verified: { label: "Verified", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  exited: { label: "Exited", tone: "neutral" },
  voided: { label: "Voided", tone: "muted" },
};

export const PURPOSE_LABELS: Record<Purpose, string> = {
  loading: "Loading",
  unloading: "Unloading",
};

// which status each action moves an entry to, and from where it's allowed
export const STATUS_TRANSITIONS: Record<StatusAction, { from: EntryStatus[]; to: EntryStatus }> = {
  verify: { from: ["arrived"], to: "verified" },
  reject: { from: ["arrived"], to: "rejected" },
  exit: { from: ["verified"], to: "exited" },
};

export const VOIDABLE_STATUSES: EntryStatus[] = ["arrived", "verified"];
export const EDITABLE_STATUSES: EntryStatus[] = ["arrived"];
export const ACTIVE_STATUSES: EntryStatus[] = ["arrived", "verified"];

export function canEdit(status: EntryStatus) {
  return EDITABLE_STATUSES.includes(status);
}

export function canVoid(status: EntryStatus) {
  return VOIDABLE_STATUSES.includes(status);
}

export function canApply(action: StatusAction, status: EntryStatus) {
  return STATUS_TRANSITIONS[action].from.includes(status);
}

export const PAGE_SIZES = [10, 20, 50];

export const DEFAULT_LIST_PARAMS: EntryListParams = {
  page: 1,
  pageSize: 10,
  search: "",
  status: [],
  checkpointId: "",
  vehicleTypeId: "",
  purpose: "",
  from: "",
  to: "",
  sortBy: "arrivedAt",
  sortDir: "desc",
};
