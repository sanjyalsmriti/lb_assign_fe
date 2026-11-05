"use client";

import * as React from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { LookupOption } from "@/types/api";
import { cn } from "@/lib/utils";

const ALL = "__all";
const PAGE_SIZE = 8; // Virtual/incremental batch rendering for instant responsiveness

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
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const isFiltered = Boolean(value);
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : allLabel;

  // Filtered option list based on search
  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase().trim();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, search]);

  // Lazy windowing / progressive slice
  const displayedOptions = React.useMemo(() => {
    return filteredOptions.slice(0, visibleCount);
  }, [filteredOptions, visibleCount]);

  const hasMore = visibleCount < filteredOptions.length;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setSearch("");
      setVisibleCount(PAGE_SIZE);
      setHighlightedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  // Load more items when scrolling near the bottom of list
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottomReached = target.scrollTop + target.clientHeight >= target.scrollHeight - 30;
    if (bottomReached && hasMore) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredOptions.length));
    }
  };

  const handleSelect = (val: string) => {
    onChange(val === ALL ? "" : val);
    setOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = (search.trim() ? 0 : 1) + displayedOptions.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!search.trim() && highlightedIndex === 0) {
        handleSelect(ALL);
      } else {
        const itemIdx = search.trim() ? highlightedIndex : highlightedIndex - 1;
        if (displayedOptions[itemIdx]) {
          handleSelect(displayedOptions[itemIdx].value);
        }
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        disabled={disabled}
        aria-label={label}
        className={cn(
          "group inline-flex h-9 min-w-36 items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-xs transition-all duration-150 hover:bg-muted/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
          isFiltered && "border-primary/40 bg-primary/5 text-foreground font-semibold",
          open && "ring-3 border-ring ring-ring/30",
          className,
        )}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
            open && "rotate-180 text-foreground",
          )}
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-64 p-0 shadow-lg ring-1 ring-border/80 border-border rounded-xl backdrop-blur-sm overflow-hidden"
      >
        {/* Search header with clean visual badge */}
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/20 px-3 py-2">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(PAGE_SIZE);
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {search ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                inputRef.current?.focus();
              }}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          ) : (
            <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 tracking-wider">
              {label}
            </span>
          )}
        </div>

        {/* Scrollable Items with incremental/lazy loading */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="max-h-60 overflow-y-auto p-1 text-xs outline-none"
        >
          {/* Default "All" option if search is empty */}
          {!search.trim() && (
            <button
              type="button"
              onClick={() => handleSelect(ALL)}
              onMouseEnter={() => setHighlightedIndex(0)}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                !value
                  ? "bg-accent/60 font-semibold text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                highlightedIndex === 0 && "bg-accent/80 text-foreground",
              )}
            >
              <span>{allLabel}</span>
              {!value && <Check className="size-3.5 text-primary" />}
            </button>
          )}

          {displayedOptions.map((option, idx) => {
            const actualIdx = search.trim() ? idx : idx + 1;
            const isSelected = value === option.value;
            const isHighlighted = highlightedIndex === actualIdx;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(actualIdx)}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
                  isSelected
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-foreground hover:bg-muted hover:text-foreground",
                  isHighlighted && "bg-accent/80 text-foreground",
                )}
              >
                <span className="truncate pr-2">{option.label}</span>
                {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
              </button>
            );
          })}

          {displayedOptions.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No results found for &ldquo;{search}&rdquo;
            </div>
          )}

          {/* Lazy load indicator if more items are remaining */}
          {hasMore && (
            <div className="flex items-center justify-center gap-1.5 py-2 text-[11px] text-muted-foreground/80 border-t border-border/40 mt-1">
              <Loader2 className="size-3 animate-spin text-muted-foreground" />
              <span>Scroll to load more ({filteredOptions.length - visibleCount} remaining)</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
