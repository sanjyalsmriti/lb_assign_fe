"use client";

import { Input } from "@/components/ui/input";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

export function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
  return (
    <fieldset className="flex items-center gap-1.5">
      <legend className="sr-only">Arrival date range</legend>
      <label className="sr-only" htmlFor="filter-from">
        From date
      </label>
      <Input
        id="filter-from"
        type="date"
        value={from}
        max={to || undefined}
        onChange={(e) => onChange({ from: e.target.value, to })}
        className="h-9 w-[9.5rem]"
      />
      <span className="text-sm text-muted-foreground" aria-hidden>
        to
      </span>
      <label className="sr-only" htmlFor="filter-to">
        To date
      </label>
      <Input
        id="filter-to"
        type="date"
        value={to}
        min={from || undefined}
        onChange={(e) => onChange({ from, to: e.target.value })}
        className="h-9 w-[9.5rem]"
      />
    </fieldset>
  );
}
