"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LookupOption } from "@/types/api";

interface MultiSelectFilterProps<T extends string> {
  label: string;
  options: (LookupOption & { value: T })[];
  value: T[];
  onChange: (value: T[]) => void;
}

export function MultiSelectFilter<T extends string>({
  label,
  options,
  value,
  onChange,
}: MultiSelectFilterProps<T>) {
  const toggle = (option: T, checked: boolean) => {
    onChange(checked ? [...value, option] : value.filter((v) => v !== option));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" className="h-9 justify-between gap-2 font-normal" />}
      >
        {label}
        {value.length > 0 && (
          <span className="rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
            {value.length}
          </span>
        )}
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) => toggle(option.value, checked)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {value.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange([])}>Clear selection</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
