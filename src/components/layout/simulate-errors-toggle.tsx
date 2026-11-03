"use client";

import { useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  isSimulatingErrors,
  setSimulatingErrors,
  subscribeSimulatingErrors,
} from "@/lib/simulate-errors";

export function SimulateErrorsToggle() {
  const queryClient = useQueryClient();
  const enabled = useSyncExternalStore(subscribeSimulatingErrors, isSimulatingErrors, () => false);

  const toggle = () => {
    const next = !enabled;
    setSimulatingErrors(next);
    toast.info(next ? "API errors are on. Requests will fail." : "API errors are off.");
    if (!next) queryClient.invalidateQueries();
  };

  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted">
      <span>
        <span className="block font-medium text-foreground">Simulate API errors</span>
        Mock backend returns 500
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={enabled}
        onChange={toggle}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-5 w-9 shrink-0 rounded-full bg-input transition-colors peer-checked:bg-destructive peer-focus-visible:ring-2 peer-focus-visible:ring-ring after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
      />
    </label>
  );
}
