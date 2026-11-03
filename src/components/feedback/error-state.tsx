import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export function ErrorState({
  title = "Couldn't load data",
  message = "Something went wrong while talking to the server.",
  onRetry,
  retrying,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center"
    >
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-5 text-destructive" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry} disabled={retrying}>
          <RotateCw className={retrying ? "animate-spin" : undefined} />
          Try again
        </Button>
      )}
    </div>
  );
}
