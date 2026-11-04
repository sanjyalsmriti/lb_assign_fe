import { z } from "zod";
import {
  entrySchema,
  statusChangeSchema,
  voidSchema,
} from "@/features/checkpoint-entries/schemas/entry-schema";
import {
  ACTIVE_STATUSES,
  canApply,
  canEdit,
  canVoid,
  STATUS_TRANSITIONS,
} from "@/features/checkpoint-entries/constants";
import {
  ENTRY_STATUSES,
  PURPOSES,
  SORTABLE_FIELDS,
  type CheckpointEntry,
  type EntryStatus,
} from "@/features/checkpoint-entries/types";
import type { PaginatedResponse } from "@/types/api";
import { getDb } from "../data/store";
import { checkpoints, findLabel, products, transporters, vehicleTypes } from "../data/lookups";
import { entryNumber } from "../data/seed";
import { HttpError, notFound } from "../http";

const CURRENT_USER = "Checkpoint User";
const STATUS_ORDER: Record<EntryStatus, number> = {
  arrived: 0,
  verified: 1,
  exited: 2,
  rejected: 3,
  voided: 4,
};

function validationError(error: z.ZodError) {
  const fieldErrors = z.flattenError(error).fieldErrors as Record<string, string[]>;
  return new HttpError(422, "VALIDATION_ERROR", "Some fields are invalid.", fieldErrors);
}


const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().default(""),
  status: z
    .string()
    .default("")
    .transform((value) => value.split(",").filter(Boolean))
    .pipe(z.array(z.enum(ENTRY_STATUSES))),
  checkpointId: z.string().default(""),
  vehicleTypeId: z.string().default(""),
  purpose: z.enum(PURPOSES).or(z.literal("")).default(""),
  from: z.iso.date().or(z.literal("")).default(""),
  to: z.iso.date().or(z.literal("")).default(""),
  sort: z
    .string()
    .default("arrivedAt:desc")
    .transform((value) => {
      const [field, dir] = value.split(":");
      return { field, dir };
    })
    .pipe(
      z.object({
        field: z.enum(SORTABLE_FIELDS),
        dir: z.enum(["asc", "desc"]),
      }),
    ),
});

const normalize = (value: string) => value.toLowerCase().replace(/[\s-]/g, "");

function compare(a: CheckpointEntry, b: CheckpointEntry, field: (typeof SORTABLE_FIELDS)[number]) {
  switch (field) {
    case "quantity":
      return a.quantity - b.quantity;
    case "arrivedAt":
      return Date.parse(a.arrivedAt) - Date.parse(b.arrivedAt);
    case "status":
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    default:
      return a[field].localeCompare(b[field]);
  }
}

export function listEntries(searchParams: URLSearchParams): PaginatedResponse<CheckpointEntry> {
  const parsed = listQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors as Record<string, string[]>;
    throw new HttpError(400, "BAD_REQUEST", "Invalid list parameters.", fieldErrors);
  }
  const q = parsed.data;
  const term = normalize(q.search);
  const fromMs = q.from ? Date.parse(`${q.from}T00:00:00+05:45`) : -Infinity;
  const toMs = q.to ? Date.parse(`${q.to}T23:59:59.999+05:45`) : Infinity;

  const filtered = getDb().entries.filter((entry) => {
    if (q.status.length && !q.status.includes(entry.status)) return false;
    if (q.checkpointId && entry.checkpointId !== q.checkpointId) return false;
    if (q.vehicleTypeId && entry.vehicleTypeId !== q.vehicleTypeId) return false;
    if (q.purpose && entry.purpose !== q.purpose) return false;

    const arrived = Date.parse(entry.arrivedAt);
    if (arrived < fromMs || arrived > toMs) return false;

    if (term) {
      const haystack = [
        entry.entryNo,
        entry.vehicleNo,
        entry.driverName,
        entry.driverPhone,
        entry.challanNo,
        entry.transporterName,
      ];
      if (!haystack.some((value) => normalize(value).includes(term))) return false;
    }
    return true;
  });

  const direction = q.sort.dir === "asc" ? 1 : -1;
  filtered.sort((a, b) => compare(a, b, q.sort.field) * direction);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / q.pageSize));
  const start = (q.page - 1) * q.pageSize;

  return {
    data: filtered.slice(start, start + q.pageSize),
    meta: { page: q.page, pageSize: q.pageSize, total, totalPages },
  };
}


function findEntry(id: string) {
  const entry = getDb().entries.find((e) => e.id === id);
  if (!entry) throw notFound("Checkpoint entry");
  return entry;
}

export function getEntry(id: string) {
  return findEntry(id);
}

function parseEntry(body: unknown, currentId?: string) {
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) throw validationError(parsed.error);
  const input = parsed.data;

  const vehicleTypeName = findLabel(vehicleTypes, input.vehicleTypeId);
  const transporterName = findLabel(transporters, input.transporterId);
  const checkpointName = findLabel(checkpoints, input.checkpointId);
  const productName = findLabel(products, input.productId);

  const fieldErrors: Record<string, string[]> = {};
  if (!vehicleTypeName) fieldErrors.vehicleTypeId = ["Unknown vehicle type"];
  if (!transporterName) fieldErrors.transporterId = ["Unknown transporter"];
  if (!checkpointName) fieldErrors.checkpointId = ["Unknown checkpoint"];
  if (!productName) fieldErrors.productId = ["Unknown product"];
  if (!vehicleTypeName || !transporterName || !checkpointName || !productName) {
    throw new HttpError(422, "VALIDATION_ERROR", "Some fields are invalid.", fieldErrors);
  }

  const clash = getDb().entries.find(
    (e) =>
      e.id !== currentId &&
      ACTIVE_STATUSES.includes(e.status) &&
      normalize(e.vehicleNo) === normalize(input.vehicleNo),
  );
  if (clash) {
    throw new HttpError(409, "DUPLICATE_ACTIVE_ENTRY", "This vehicle already has an active entry.", {
      vehicleNo: [`Vehicle already has an active entry (${clash.entryNo})`],
    });
  }

  return {
    ...input,
    arrivedAt: new Date(input.arrivedAt).toISOString(),
    vehicleTypeName,
    transporterName,
    checkpointName,
    productName,
  };
}

export function createEntry(body: unknown) {
  const db = getDb();
  const fields = parseEntry(body);
  const now = new Date().toISOString();

  db.entrySeq += 1;
  const entry: CheckpointEntry = {
    ...fields,
    id: crypto.randomUUID(),
    entryNo: entryNumber(new Date(fields.arrivedAt), db.entrySeq),
    tokenNo: null,
    status: "arrived",
    statusReason: null,
    history: [{ status: "arrived", at: now, by: CURRENT_USER }],
    createdAt: now,
    updatedAt: now,
  };

  db.entries.push(entry);
  return entry;
}

export function updateEntry(id: string, body: unknown) {
  const entry = findEntry(id);
  if (!canEdit(entry.status)) {
    throw new HttpError(409, "NOT_EDITABLE", "Only entries waiting for verification can be edited.");
  }
  Object.assign(entry, parseEntry(body, id), { updatedAt: new Date().toISOString() });
  return entry;
}


export function changeStatus(id: string, body: unknown) {
  const parsed = statusChangeSchema.safeParse(body);
  if (!parsed.success) throw validationError(parsed.error);
  const { action, reason } = parsed.data;

  const entry = findEntry(id);
  if (!canApply(action, entry.status)) {
    throw new HttpError(409, "INVALID_TRANSITION", `Can't ${action} an entry that is ${entry.status}.`);
  }

  const now = new Date().toISOString();
  const next = STATUS_TRANSITIONS[action].to;
  let note: string | undefined;

  if (action === "verify") {
    const db = getDb();
    db.tokenSeq += 1;
    entry.tokenNo = `T-${String(db.tokenSeq).padStart(4, "0")}`;
    note = `Token ${entry.tokenNo} issued`;
  }
  if (action === "reject") {
    entry.statusReason = reason!.trim();
    note = entry.statusReason;
  }

  entry.status = next;
  entry.updatedAt = now;
  entry.history.push({ status: next, at: now, by: CURRENT_USER, note });
  return entry;
}

export function voidEntry(id: string, body: unknown) {
  const parsed = voidSchema.safeParse(body);
  if (!parsed.success) throw validationError(parsed.error);

  const entry = findEntry(id);
  if (!canVoid(entry.status)) {
    throw new HttpError(409, "INVALID_TRANSITION", `Can't void an entry that is ${entry.status}.`);
  }

  const now = new Date().toISOString();
  entry.status = "voided";
  entry.statusReason = parsed.data.reason;
  entry.updatedAt = now;
  entry.history.push({ status: "voided", at: now, by: CURRENT_USER, note: parsed.data.reason });
  return entry;
}
