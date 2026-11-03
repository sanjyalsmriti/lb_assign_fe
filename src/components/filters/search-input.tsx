"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  delay?: number;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  label = "Search",
  delay = 400,
  className,
}: SearchInputProps) {
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);

  // keep in sync when the value is changed from outside (e.g. "Clear filters")
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => onChange(text), delay);
    return () => clearTimeout(timer);
  }, [text, value, delay, onChange]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label={label}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onChange(text);
        }}
        placeholder={placeholder}
        className="h-9 pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            setText("");
            onChange("");
          }}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
