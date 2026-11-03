"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LookupOption } from "@/types/api";
import { cn } from "@/lib/utils";

const ALL = "__all";

interface FilterSelectProps {
  label: string;
  value: string;
  options: LookupOption[];
  onChange: (value: string) => void;
  allLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  allLabel = "All",
  disabled,
  className,
}: FilterSelectProps) {
  const items = [{ value: ALL, label: allLabel }, ...options];

  return (
    <Select
      items={items}
      value={value || ALL}
      onValueChange={(next) => onChange(next === ALL || next == null ? "" : String(next))}
      disabled={disabled}
    >
      <SelectTrigger aria-label={label} className={cn("h-9 min-w-36", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start">
        {items.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
