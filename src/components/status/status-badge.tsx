import { cn } from "@/lib/utils";

export type StatusTone = "info" | "success" | "warning" | "danger" | "neutral" | "muted";

const toneClasses: Record<StatusTone, string> = {
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  neutral: "bg-slate-100 text-slate-700 ring-slate-500/20",
  muted: "bg-zinc-50 text-zinc-500 ring-zinc-400/20",
};

const dotClasses: Record<StatusTone, string> = {
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  neutral: "bg-slate-500",
  muted: "bg-zinc-400",
};

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
  className?: string;
}

export function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        toneClasses[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotClasses[tone])} aria-hidden />
      {label}
    </span>
  );
}
