"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LookupOption } from "@/types/api";

interface SelectFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: LookupOption[];
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
}

export function SelectField({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Select…",
  invalid,
  describedBy,
  disabled,
}: SelectFieldProps) {
  return (
    <Select
      items={options}
      value={value || null}
      onValueChange={(next) => onChange(next == null ? "" : String(next))}
      onOpenChange={(open) => {
        if (!open) onBlur?.();
      }}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className="h-9 w-full"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
