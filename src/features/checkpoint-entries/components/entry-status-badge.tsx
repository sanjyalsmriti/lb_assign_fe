import { StatusBadge } from "@/components/status/status-badge";
import { STATUS_CONFIG } from "../constants";
import type { EntryStatus } from "../types";

export function EntryStatusBadge({ status }: { status: EntryStatus }) {
  const { label, tone } = STATUS_CONFIG[status];
  return <StatusBadge label={label} tone={tone} />;
}
