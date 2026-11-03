import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_LIST_PARAMS, PAGE_SIZES } from "../constants";
import {
  ENTRY_STATUSES,
  PURPOSES,
  SORTABLE_FIELDS,
  type EntryListParams,
  type EntryStatus,
  type Purpose,
  type SortField,
} from "../types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseParams(searchParams: URLSearchParams): EntryListParams {
  const page = Number(searchParams.get("page"));
  const pageSize = Number(searchParams.get("pageSize"));
  const [sortBy, sortDir] = (searchParams.get("sort") ?? "").split(":");
  const purpose = searchParams.get("purpose") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: PAGE_SIZES.includes(pageSize) ? pageSize : DEFAULT_LIST_PARAMS.pageSize,
    search: searchParams.get("search") ?? "",
    status: (searchParams.get("status") ?? "")
      .split(",")
      .filter((s): s is EntryStatus => ENTRY_STATUSES.includes(s as EntryStatus)),
    checkpointId: searchParams.get("checkpointId") ?? "",
    vehicleTypeId: searchParams.get("vehicleTypeId") ?? "",
    purpose: PURPOSES.includes(purpose as Purpose) ? (purpose as Purpose) : "",
    from: DATE_RE.test(from) ? from : "",
    to: DATE_RE.test(to) ? to : "",
    sortBy: SORTABLE_FIELDS.includes(sortBy as SortField)
      ? (sortBy as SortField)
      : DEFAULT_LIST_PARAMS.sortBy,
    sortDir: sortDir === "asc" || sortDir === "desc" ? sortDir : DEFAULT_LIST_PARAMS.sortDir,
  };
}

function toQueryString(params: EntryListParams) {
  const query = new URLSearchParams();
  const d = DEFAULT_LIST_PARAMS;

  if (params.page !== d.page) query.set("page", String(params.page));
  if (params.pageSize !== d.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", params.search);
  if (params.status.length) query.set("status", params.status.join(","));
  if (params.checkpointId) query.set("checkpointId", params.checkpointId);
  if (params.vehicleTypeId) query.set("vehicleTypeId", params.vehicleTypeId);
  if (params.purpose) query.set("purpose", params.purpose);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.sortBy !== d.sortBy || params.sortDir !== d.sortDir) {
    query.set("sort", `${params.sortBy}:${params.sortDir}`);
  }
  return query.toString();
}

export function useEntryListParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params = useMemo(() => parseParams(searchParams), [searchParams]);

  const setParams = useCallback(
    (patch: Partial<EntryListParams>) => {
      const next = { ...params, ...patch };
      // any filter/sort change should start again from the first page
      if (patch.page === undefined) next.page = 1;
      const qs = toQueryString(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const hasActiveFilters = Boolean(
    params.search ||
      params.status.length ||
      params.checkpointId ||
      params.vehicleTypeId ||
      params.purpose ||
      params.from ||
      params.to,
  );

  return { params, setParams, resetFilters, hasActiveFilters };
}
