import { Skeleton } from "@/components/ui/skeleton";

export function EntryFormSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading form">
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="space-y-5 rounded-xl border bg-card p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
