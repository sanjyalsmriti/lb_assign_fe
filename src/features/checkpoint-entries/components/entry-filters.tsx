"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/filters/search-input";
import { FilterSelect } from "@/components/filters/filter-select";
import { MultiSelectFilter } from "@/components/filters/multi-select-filter";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { PURPOSE_LABELS, STATUS_CONFIG } from "../constants";
import { useLookup } from "../hooks/use-entries";
import { ENTRY_STATUSES, PURPOSES, type EntryListParams, type Purpose } from "../types";

const statusOptions = ENTRY_STATUSES.map((value) => ({ value, label: STATUS_CONFIG[value].label }));
const purposeOptions = PURPOSES.map((value) => ({ value, label: PURPOSE_LABELS[value] }));

interface EntryFiltersProps {
  params: EntryListParams;
  onChange: (patch: Partial<EntryListParams>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function EntryFilters({ params, onChange, onReset, hasActiveFilters }: EntryFiltersProps) {
  const checkpoints = useLookup("checkpoints");
  const vehicleTypes = useLookup("vehicle-types");

  return (
    <div className="space-y-3 rounded-xl border bg-card p-3 sm:p-4">
      <SearchInput
        value={params.search}
        onChange={(search) => onChange({ search })}
        placeholder="Search entry, vehicle, driver, phone or challan"
        label="Search entries"
        className="w-full"
      />
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          label="Status"
          options={statusOptions}
          value={params.status}
          onChange={(status) => onChange({ status })}
        />
        <FilterSelect
          label="Checkpoint"
          allLabel="All checkpoints"
          value={params.checkpointId}
          options={checkpoints.data ?? []}
          disabled={checkpoints.isPending}
          onChange={(checkpointId) => onChange({ checkpointId })}
        />
        <FilterSelect
          label="Vehicle type"
          allLabel="All vehicle types"
          value={params.vehicleTypeId}
          options={vehicleTypes.data ?? []}
          disabled={vehicleTypes.isPending}
          onChange={(vehicleTypeId) => onChange({ vehicleTypeId })}
        />
        <FilterSelect
          label="Purpose"
          allLabel="Any purpose"
          value={params.purpose}
          options={purposeOptions}
          onChange={(purpose) => onChange({ purpose: purpose as Purpose | "" })}
          className="min-w-32"
        />
        <DateRangeFilter
          from={params.from}
          to={params.to}
          onChange={(range) => onChange(range)}
        />
        {hasActiveFilters && (
          <Button variant="ghost" className="h-9" onClick={onReset}>
            <X />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
